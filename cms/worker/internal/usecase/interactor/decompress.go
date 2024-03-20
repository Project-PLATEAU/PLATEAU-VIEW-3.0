package interactor

import (
	"context"
	"errors"
	"io"
	"path"
	"strings"

	"github.com/reearth/reearth-cms/worker/pkg/asset"
	"github.com/reearth/reearth-cms/worker/pkg/decompressor"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

func (u *Usecase) Decompress(ctx context.Context, assetID, assetPath string) error {
	err := u.decompress(ctx, assetID, assetPath)
	if errors.Is(err, context.DeadlineExceeded) || errors.Is(err, context.Canceled) {
		log.Errorf("timeout decompress asset, Asset=%s, Path=%s", assetID, assetPath)
		return err
	}
	if err != nil {
		log.Errorf("failed to decompress asset, Asset=%s, Path=%s, Error=%s", assetID, assetPath, err)
		return u.gateways.CMS.NotifyAssetDecompressed(ctx, assetID, lo.ToPtr(asset.ArchiveExtractionStatusFailed))
	}
	return u.gateways.CMS.NotifyAssetDecompressed(ctx, assetID, lo.ToPtr(asset.ArchiveExtractionStatusDone))
}

func (u *Usecase) decompress(ctx context.Context, assetID, assetPath string) error {
	ext := strings.TrimPrefix(path.Ext(assetPath), ".")
	base := strings.TrimPrefix(strings.TrimSuffix(assetPath, "."+ext), "/")

	compressedFile, size, proceeded, err := u.gateways.File.Read(ctx, assetPath)
	if err != nil {
		log.Errorf("failed to load archive file from storage, Asset=%s, Path=%s, Err=%s", assetID, assetPath, err.Error())
		return err
	}
	log.Infof("archive file downloaded from storage, Size=%d", size)

	uploadFunc := func(name string) (io.WriteCloser, error) {
		w, err := u.gateways.File.Upload(ctx, smartJoinPath(base, name))
		if err != nil {
			return nil, err
		}
		return w, nil
	}

	de, err := decompressor.New(compressedFile, size, ext, uploadFunc)
	if err != nil {
		if errors.Is(err, decompressor.ErrUnsupportedExtension) {
			log.Warnf("unsupported extension: decompression skipped assetID=%s ext=%s", assetID, ext)
			return nil
		}
		return err
	}

	progressFunc := func(ctx context.Context, proceeded int64) error {
		if proceeded%1000 != 0 {
			return nil
		}
		return u.gateways.File.WriteProceeded(ctx, assetPath, proceeded)
	}

	if err := de.Decompress(ctx, proceeded, progressFunc); err != nil {
		return err
	}

	return nil
}

func smartJoinPath(firstPath, secondPath string) string {
	lastElementOfFirstPath := path.Base(firstPath)
	tempArray := strings.Split(secondPath, "/")
	firstElementOfSecondPath := tempArray[0]

	if lastElementOfFirstPath == firstElementOfSecondPath {
		return path.Join(path.Dir(firstPath), secondPath)
	}

	return path.Join(firstPath, secondPath)
}
