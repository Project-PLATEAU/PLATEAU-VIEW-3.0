package aws

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"path"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

const (
	s3AssetBasePath string = "assets"
)

type fileRepo struct {
	bucketName   string
	cacheControl string
	s3Client     *s3.Client
	s3Uploader   *manager.Uploader
}

func NewFile(ctx context.Context, bucketName, cacheControl string) (gateway.File, error) {
	if bucketName == "" {
		return nil, errors.New("bucket name is empty")
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		log.Errorf("aws: failed to create config: %v\n", err)
		return nil, rerror.ErrInternalBy(err)
	}

	s3Client := s3.NewFromConfig(cfg)
	s3Uploader := manager.NewUploader(s3Client)

	return &fileRepo{
		bucketName:   bucketName,
		cacheControl: cacheControl,
		s3Client:     s3Client,
		s3Uploader:   s3Uploader,
	}, nil
}

func (f *fileRepo) Read(ctx context.Context, filePath string) (gateway.ReadAtCloser, int64, int64, error) {
	if filePath == "" {
		return nil, 0, 0, rerror.ErrNotFound
	}

	objectKey := getS3ObjectKeyFromURL(s3AssetBasePath, filePath)

	params := &s3.GetObjectInput{
		Bucket: &f.bucketName,
		Key:    &objectKey,
	}

	resp, err := f.s3Client.GetObject(ctx, params)
	if err != nil {
		log.Errorf("aws: read object err: %+v\n", err)
		return nil, 0, 0, rerror.ErrInternalBy(err)
	}

	proceeded, _ := strconv.ParseInt(resp.Metadata["proceeded"], 10, 64)

	// Read all data into memory
	objectData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, 0, err
	}

	reader := bytes.NewReader(objectData)
	bufReader := buffer{
		b: *reader,
	}

	return &bufReader, int64(len(objectData)), proceeded, nil
}

func (f *fileRepo) Upload(_ context.Context, name string) (io.WriteCloser, error) {
	if name == "" {
		return nil, gateway.ErrInvalidFile
	}

	pr, pw := io.Pipe()

	go func() {
		defer pw.Close()

		uploadCtx := context.Background()
		key := path.Join(s3AssetBasePath, name)

		params := &s3.PutObjectInput{
			Bucket:       &f.bucketName,
			Key:          &key,
			CacheControl: &f.cacheControl,
			Body:         pr,
			Metadata:     make(map[string]string),
		}

		_, err := f.s3Uploader.Upload(uploadCtx, params)
		if err != nil {
			log.Errorf("aws: upload object err: %v\n", err)
		}
	}()

	return &writeCloser{Writer: pw}, nil
}

func (f *fileRepo) WriteProceeded(ctx context.Context, filePath string, proceeded int64) error {
	if filePath == "" {
		return rerror.ErrNotFound
	}

	objectKey := getS3ObjectKeyFromURL(s3AssetBasePath, filePath)

	params := &s3.CopyObjectInput{
		Bucket:     &f.bucketName,
		CopySource: aws.String(fmt.Sprintf("%s/%s", f.bucketName, objectKey)),
		Key:        &objectKey,
		Metadata: map[string]string{
			"proceeded": strconv.FormatInt(proceeded, 10),
		},
	}

	_, err := f.s3Client.CopyObject(ctx, params)
	if err != nil {
		return fmt.Errorf("copy object: %w", err)
	}

	return nil
}

func getS3ObjectKeyFromURL(assetBasePath, assetPath string) string {
	if assetPath == "" {
		return ""
	}

	return path.Join(assetBasePath, assetPath)
}
