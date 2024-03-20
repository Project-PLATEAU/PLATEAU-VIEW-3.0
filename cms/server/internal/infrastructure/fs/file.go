package fs

import (
	"context"
	"errors"
	"io"
	"io/fs"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/spf13/afero"
)

type fileRepo struct {
	fs      afero.Fs
	urlBase *url.URL
}

func NewFile(fs afero.Fs, urlBase string) (gateway.File, error) {
	var b *url.URL
	if urlBase == "" {
		urlBase = defaultBase
	}

	var err error
	b, err = url.Parse(urlBase)
	if err != nil {
		return nil, ErrInvalidBaseURL
	}

	return &fileRepo{
		fs:      fs,
		urlBase: b,
	}, nil
}

func (f *fileRepo) ReadAsset(_ context.Context, fileUUID string, fn string) (io.ReadCloser, error) {
	if fileUUID == "" || fn == "" {
		return nil, rerror.ErrNotFound
	}

	p := getFSObjectPath(fileUUID, fn)

	return f.read(p)
}

func (f *fileRepo) GetAssetFiles(_ context.Context, fileUUID string) ([]gateway.FileEntry, error) {
	if fileUUID == "" {
		return nil, rerror.ErrNotFound
	}

	p := getFSObjectPath(fileUUID, "")
	var fileEntries []gateway.FileEntry
	err := afero.Walk(f.fs, p, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		fileEntries = append(fileEntries, gateway.FileEntry{
			Name: strings.ReplaceAll(lo.Must1(filepath.Rel(p, path)), "\\", "/"),
			Size: info.Size(),
		})
		return nil
	})
	if err != nil {
		if errors.Is(err, afero.ErrFileNotFound) {
			return nil, gateway.ErrFileNotFound
		} else {
			return nil, rerror.ErrInternalBy(err)
		}
	}

	if len(fileEntries) == 0 {
		return nil, gateway.ErrFileNotFound
	}

	return fileEntries, nil
}

func (f *fileRepo) UploadAsset(_ context.Context, file *file.File) (string, int64, error) {
	if file == nil {
		return "", 0, gateway.ErrInvalidFile
	}
	if file.Size >= fileSizeLimit {
		return "", 0, gateway.ErrFileTooLarge
	}

	fileUUID := newUUID()

	p := getFSObjectPath(fileUUID, file.Name)

	size, err := f.upload(p, file.Content)
	if err != nil {
		return "", 0, err
	}

	return fileUUID, size, nil
}

func (f *fileRepo) DeleteAsset(_ context.Context, fileUUID string, fn string) error {
	if fileUUID == "" || fn == "" {
		return gateway.ErrInvalidFile
	}

	p := getFSObjectPath(fileUUID, fn)

	return f.delete(p)
}

func (f *fileRepo) GetURL(a *asset.Asset) string {
	fileUUID := a.UUID()
	return f.urlBase.JoinPath(assetDir, fileUUID[:2], fileUUID[2:], url.PathEscape(a.FileName())).String()
}

func (f *fileRepo) IssueUploadAssetLink(ctx context.Context, param gateway.IssueUploadAssetParam) (*gateway.UploadAssetLink, error) {
	return nil, gateway.ErrUnsupportedOperation
}

func (f *fileRepo) UploadedAsset(ctx context.Context, u *asset.Upload) (*file.File, error) {
	return nil, gateway.ErrUnsupportedOperation
}

// helpers

func (f *fileRepo) read(filename string) (io.ReadCloser, error) {
	if filename == "" {
		return nil, rerror.ErrNotFound
	}

	file, err := f.fs.Open(filename)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, rerror.ErrNotFound
		}
		return nil, rerror.ErrInternalBy(err)
	}
	return file, nil
}

func (f *fileRepo) upload(filename string, content io.Reader) (int64, error) {
	if filename == "" || content == nil {
		return 0, gateway.ErrFailedToUploadFile
	}

	if fnd := filepath.Dir(filename); fnd != "" {
		if err := f.fs.MkdirAll(fnd, 0755); err != nil {
			return 0, rerror.ErrInternalBy(err)
		}
	}

	dest, err := f.fs.Create(filename)
	if err != nil {
		return 0, rerror.ErrInternalBy(err)
	}
	defer func() {
		_ = dest.Close()
	}()

	var size int64
	if size, err = io.Copy(dest, content); err != nil {
		return 0, gateway.ErrFailedToUploadFile
	}

	return size, nil
}

func (f *fileRepo) delete(filename string) error {
	if filename == "" {
		return gateway.ErrFailedToUploadFile
	}

	if err := f.fs.RemoveAll(filename); err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func getFSObjectPath(fileUUID, objectName string) string {
	if fileUUID == "" || !IsValidUUID(fileUUID) {
		return ""
	}

	return filepath.Join(assetDir, fileUUID[:2], fileUUID[2:], objectName)
}

func newUUID() string {
	return uuid.NewString()
}

func IsValidUUID(fileUUID string) bool {
	_, err := uuid.Parse(fileUUID)
	return err == nil
}
