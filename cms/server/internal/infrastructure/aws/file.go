package aws

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net/url"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

const (
	s3AssetBasePath string        = "assets"
	fileSizeLimit   int64         = 10 * 1024 * 1024 * 1024 // 10GB
	expires         time.Duration = time.Minute * 15
)

type fileRepo struct {
	bucketName   string
	baseURL      *url.URL
	cacheControl string
	s3Client     *s3.Client
}

func NewFile(ctx context.Context, bucketName, baseURL, cacheControl string) (gateway.File, error) {
	if bucketName == "" {
		return nil, errors.New("bucket name is empty")
	}

	var u *url.URL
	if baseURL == "" {
		baseURL = fmt.Sprintf("https://%s.s3.amazonaws.com/", bucketName)
	}

	var err error
	u, _ = url.Parse(baseURL)
	if err != nil {
		return nil, rerror.NewE(i18n.T("invalid base URL"))
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}

	return &fileRepo{
		bucketName:   bucketName,
		baseURL:      u,
		cacheControl: cacheControl,
		s3Client:     s3.NewFromConfig(cfg),
	}, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, u string, fn string) (io.ReadCloser, error) {
	p := getS3ObjectPath(u, fn)
	if p == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, p)
}

func (f *fileRepo) GetAssetFiles(ctx context.Context, u string) ([]gateway.FileEntry, error) {
	p := getS3ObjectPath(u, "")
	var fileEntries []gateway.FileEntry
	paginator := s3.NewListObjectsV2Paginator(f.s3Client, &s3.ListObjectsV2Input{
		Bucket: aws.String(f.bucketName),
		Prefix: aws.String(p),
	})

	for paginator.HasMorePages() {
		output, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, rerror.ErrInternalBy(err)
		}
		for _, obj := range output.Contents {
			fe := gateway.FileEntry{
				Name: strings.TrimPrefix(lo.FromPtr(obj.Key), p),
				Size: lo.FromPtr(obj.Size),
			}
			fileEntries = append(fileEntries, fe)
		}
	}

	if len(fileEntries) == 0 {
		return nil, gateway.ErrFileNotFound
	}

	return fileEntries, nil
}

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (string, int64, error) {
	if file == nil {
		return "", 0, gateway.ErrInvalidFile
	}
	if file.Size >= fileSizeLimit {
		return "", 0, gateway.ErrFileTooLarge
	}

	fileUUID := newUUID()
	p := getS3ObjectPath(fileUUID, file.Name)
	if p == "" {
		return "", 0, gateway.ErrInvalidFile
	}
	size, err := f.upload(ctx, p, file.Content)
	if err != nil {
		return "", 0, rerror.ErrInternalBy(err)
	}

	return fileUUID, size, nil
}

func (f *fileRepo) DeleteAsset(ctx context.Context, u string, fn string) error {
	p := getS3ObjectPath(u, fn)
	if p == "" {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, p)
}

func (f *fileRepo) GetURL(a *asset.Asset) string {
	return getURL(f.baseURL.String(), a.UUID(), a.FileName())
}

func (f *fileRepo) IssueUploadAssetLink(ctx context.Context, param gateway.IssueUploadAssetParam) (*gateway.UploadAssetLink, error) {
	// https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html
	const maxPartSize = 5 * 1024 * 1024 * 1024
	p := getS3ObjectPath(param.UUID, param.Filename)
	if p == "" {
		return nil, gateway.ErrInvalidFile
	}
	contentType := param.ContentType()
	if param.Cursor != "" {
		cursor, err := parseUploadCursor(param.Cursor)
		if err != nil {
			return nil, fmt.Errorf("parse cursor(%s): %w", param.Cursor, err)
		}
		uploaded := maxPartSize * (cursor.Part - 1)
		if completed := param.ContentLength <= uploaded; completed {
			var mu types.CompletedMultipartUpload
			var marker *string
			for {
				o, err := f.s3Client.ListParts(ctx, &s3.ListPartsInput{
					Bucket:           aws.String(f.bucketName),
					Key:              aws.String(p),
					UploadId:         aws.String(cursor.UploadID),
					PartNumberMarker: marker,
				})
				if err != nil {
					return nil, fmt.Errorf("list parts: %w", err)
				}
				for _, part := range o.Parts {
					mu.Parts = append(mu.Parts, types.CompletedPart{
						ETag:       part.ETag,
						PartNumber: part.PartNumber,
					})
				}
				if o.IsTruncated == nil || !*o.IsTruncated {
					break
				}
				marker = o.PartNumberMarker
			}
			if _, err := f.s3Client.CompleteMultipartUpload(ctx, &s3.CompleteMultipartUploadInput{
				Bucket:          aws.String(f.bucketName),
				Key:             aws.String(p),
				UploadId:        aws.String(cursor.UploadID),
				MultipartUpload: &mu,
			}); err != nil {
				return nil, fmt.Errorf("complete multipart uplaod: %w", err)
			}
			return &gateway.UploadAssetLink{}, nil
		} else {
			partSize := min(param.ContentLength-uploaded, maxPartSize)
			presigned, err := s3.NewPresignClient(f.s3Client).PresignUploadPart(ctx, &s3.UploadPartInput{
				Bucket:        aws.String(f.bucketName),
				Key:           aws.String(p),
				PartNumber:    aws.Int32(int32(cursor.Part)),
				UploadId:      aws.String(cursor.UploadID),
				ContentLength: aws.Int64(partSize),
			}, func(options *s3.PresignOptions) {
				options.Expires = expires
			})
			if err != nil {
				return nil, fmt.Errorf("presign upload part: %w", err)
			}
			return &gateway.UploadAssetLink{
				URL:           presigned.URL,
				ContentLength: partSize,
				Next:          cursor.Next().String(),
			}, nil
		}
	}

	// PutObject can only be used for up to 5GB
	// Conversely, multipart upload cannot be used for files smaller than 5MB
	// Since PutObject reduces the number of interactions, use PutObject for files smaller than 5GB
	if param.ContentLength <= maxPartSize {
		presigned, err := s3.NewPresignClient(f.s3Client).PresignPutObject(ctx, &s3.PutObjectInput{
			Bucket:        aws.String(f.bucketName),
			CacheControl:  aws.String(f.cacheControl),
			Key:           aws.String(p),
			ContentType:   aws.String(contentType),
			ContentLength: aws.Int64(param.ContentLength),
		}, func(options *s3.PresignOptions) {
			options.Expires = expires
		})
		if err != nil {
			return nil, rerror.ErrInternalBy(err)
		}
		return &gateway.UploadAssetLink{
			URL:           presigned.URL,
			ContentType:   contentType,
			ContentLength: param.ContentLength,
		}, nil
	}
	r, err := f.s3Client.CreateMultipartUpload(ctx, &s3.CreateMultipartUploadInput{
		Bucket:       aws.String(f.bucketName),
		CacheControl: aws.String(f.cacheControl),
		Key:          aws.String(p),
		ContentType:  aws.String(contentType),
	})
	if err != nil {
		return nil, fmt.Errorf("create multipart upload: %w", err)
	}
	presigned, err := s3.NewPresignClient(f.s3Client).PresignUploadPart(ctx, &s3.UploadPartInput{
		Bucket:        aws.String(f.bucketName),
		Key:           aws.String(p),
		PartNumber:    aws.Int32(1),
		UploadId:      r.UploadId,
		ContentLength: aws.Int64(maxPartSize),
	}, func(options *s3.PresignOptions) {
		options.Expires = expires
	})
	if err != nil {
		return nil, fmt.Errorf("presign upload part: %w", err)
	}
	return &gateway.UploadAssetLink{
		URL:           presigned.URL,
		ContentLength: maxPartSize,
		Next:          uploadCursor{UploadID: lo.FromPtr(r.UploadId), Part: 2}.String(),
	}, nil
}

func (f *fileRepo) UploadedAsset(ctx context.Context, u *asset.Upload) (*file.File, error) {
	p := getS3ObjectPath(u.UUID(), u.FileName())
	obj, err := f.s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(p),
	})
	if err != nil {
		return nil, err
	}

	file := &file.File{
		Content:     nil,
		Name:        u.FileName(),
		Size:        lo.FromPtr(obj.ContentLength),
		ContentType: lo.FromPtr(obj.ContentType),
	}
	return file, nil
}

func (f *fileRepo) read(ctx context.Context, filename string) (io.ReadCloser, error) {
	if filename == "" {
		return nil, rerror.ErrNotFound
	}

	resp, err := f.s3Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(filename),
	})
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	return resp.Body, nil
}

func (f *fileRepo) upload(ctx context.Context, filename string, content io.Reader) (int64, error) {
	if filename == "" {
		return 0, gateway.ErrInvalidFile
	}

	ba, err := io.ReadAll(content)
	if err != nil {
		return 0, rerror.ErrInternalBy(err)
	}
	body := bytes.NewReader(ba)

	_, err = f.s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:       aws.String(f.bucketName),
		CacheControl: aws.String(f.cacheControl),
		Key:          aws.String(filename),
		Body:         body,
	})
	if err != nil {
		return 0, gateway.ErrFailedToUploadFile
	}

	result, err := f.s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(filename),
	})

	if err != nil {
		return 0, gateway.ErrFailedToUploadFile
	}

	return lo.FromPtr(result.ContentLength), nil
}

func (f *fileRepo) delete(ctx context.Context, filename string) error {
	if filename == "" {
		return gateway.ErrInvalidFile
	}

	_, err := f.s3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(filename),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	return nil
}

func getS3ObjectPath(uuid, objectName string) string {
	if uuid == "" || !isValidUUID(uuid) {
		return ""
	}

	return path.Join(s3AssetBasePath, uuid[:2], uuid[2:], objectName)
}

func newUUID() string {
	return uuid.New().String()
}

func isValidUUID(u string) bool {
	_, err := uuid.Parse(u)
	return err == nil
}

func getURL(host, uuid, fName string) string {
	baseURL, _ := url.Parse(host)
	return baseURL.JoinPath(s3AssetBasePath, uuid[:2], uuid[2:], fName).String()
}

type uploadCursor struct {
	UploadID string
	Part     int64 // 1-indexed
}

func (c uploadCursor) Next() uploadCursor {
	return uploadCursor{UploadID: c.UploadID, Part: c.Part + 1}
}

func (c uploadCursor) String() string {
	return strconv.FormatInt(c.Part, 10) + "_" + c.UploadID
}

func parseUploadCursor(c string) (*uploadCursor, error) {
	partStr, uploadID, found := strings.Cut(c, "_")
	if !found {
		return nil, fmt.Errorf("separator not found")
	}
	part, err := strconv.ParseInt(partStr, 10, 32)
	if err != nil {
		return nil, fmt.Errorf("parse part: %w", err)
	}
	return &uploadCursor{
		UploadID: uploadID,
		Part:     part,
	}, nil
}
