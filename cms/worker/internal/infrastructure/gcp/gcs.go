package gcp

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"path"
	"strconv"

	"cloud.google.com/go/storage"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

const (
	gcsAssetBasePath string = "assets"
)

type fileRepo struct {
	bucketName   string
	cacheControl string
	bucket       *storage.BucketHandle
}

func NewFile(bucketName string, cacheControl string) (gateway.File, error) {
	if bucketName == "" {
		return nil, errors.New("bucket name is empty")
	}

	return &fileRepo{
		bucketName:   bucketName,
		cacheControl: cacheControl,
	}, nil
}

func (f *fileRepo) Read(ctx context.Context, path string) (gateway.ReadAtCloser, int64, int64, error) {
	if path == "" {
		return nil, 0, 0, rerror.ErrNotFound
	}
	objectName := getGCSObjectNameFromURL(gcsAssetBasePath, path)
	return f.readAll(ctx, objectName)
}

func (f *fileRepo) Upload(ctx context.Context, name string) (io.WriteCloser, error) {
	if name == "" {
		return nil, gateway.ErrInvalidFile
	}

	bucket, err := f.getBucket(ctx)
	if err != nil {
		log.Errorf("gcs: upload bucket err: %+v\n", err)
		return nil, rerror.ErrInternalBy(err)
	}

	name = path.Join(gcsAssetBasePath, name)

	object := bucket.Retryer(storage.WithPolicy(storage.RetryAlways)).Object(name)
	writer := object.NewWriter(ctx)
	writer.ObjectAttrs.CacheControl = f.cacheControl
	return writer, nil
}

func (f *fileRepo) WriteProceeded(ctx context.Context, path string, proceeded int64) error {
	objectName := getGCSObjectNameFromURL(gcsAssetBasePath, path)
	bucket, err := f.getBucket(ctx)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	obj := bucket.Object(objectName)
	_, err = obj.Update(ctx, storage.ObjectAttrsToUpdate{
		Metadata: map[string]string{
			"proceeded": strconv.FormatInt(proceeded, 10),
		},
	})
	if err != nil {
		return fmt.Errorf("update attr: %w", err)
	}
	return nil
}

func (f *fileRepo) readAll(ctx context.Context, objectName string) (gateway.ReadAtCloser, int64, int64, error) {
	if objectName == "" {
		return nil, 0, 0, rerror.ErrNotFound
	}

	bucket, err := f.getBucket(ctx)
	if err != nil {
		log.Errorf("gcs: read bucket err: %+v\n", err)
		return nil, 0, 0, rerror.ErrInternalBy(err)
	}

	obj := bucket.Object(objectName)
	r, err := obj.NewReader(ctx)
	if err != nil {
		return nil, 0, 0, err
	}
	attrs, err := obj.Attrs(ctx)
	if err != nil {
		return nil, 0, 0, err
	}
	proceeded, _ := strconv.ParseInt(attrs.Metadata["proceeded"], 10, 64)

	// read all data on memory
	objectData, err := io.ReadAll(r)
	if err != nil {
		return nil, 0, 0, err
	}

	reader := bytes.NewReader(objectData)
	bufReader := buffer{
		*reader,
	}

	return &bufReader, int64(len(objectData)), proceeded, nil
}

func (f *fileRepo) getBucket(ctx context.Context) (*storage.BucketHandle, error) {
	if f.bucket == nil {
		client, err := storage.NewClient(ctx)
		if err != nil {
			return nil, err
		}
		f.bucket = client.Bucket(f.bucketName)
	}
	return f.bucket, nil
}

func getGCSObjectNameFromURL(assetBasePath string, assetPath string) string {
	if assetPath == "" {
		return ""
	}
	return path.Join(assetBasePath, assetPath)
}

type buffer struct {
	b bytes.Reader
}

func (b *buffer) Close() error {
	return nil
}

func (b *buffer) ReadAt(b2 []byte, off int64) (n int, err error) {
	return b.b.ReadAt(b2, off)
}
