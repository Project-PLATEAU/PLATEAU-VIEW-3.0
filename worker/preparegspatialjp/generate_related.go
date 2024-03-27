package preparegspatialjp

import (
	"context"
	"fmt"

	"github.com/reearth/reearthx/log"
)

func PrepareRelated(ctx context.Context, cw *CMSWrapper, mc MergeContext) (res string, err error) {
	defer func() {
		if err == nil {
			return
		}
		err = fmt.Errorf("関連データセットの設定に失敗しました: %w", err)
		cw.NotifyError(ctx, err, false, false, false)
	}()

	log.Infofc(ctx, "downloading related dataset...")

	cityItem := mc.CityItem
	dir := mc.TmpDir

	if cityItem.RelatedDataset == "" {
		log.Infofc(ctx, "related dataset is not set to the cit item, but it's ok to continue")
		return "", nil
	}

	item, err := cw.GetItem(ctx, cityItem.RelatedDataset, true)
	if err != nil {
		return "", err
	}

	if item == nil {
		return "", nil
	}

	var id, url string
	merged := item.FieldByKey("merged").GetValue()
	if merged != nil {
		id = merged.AssetID()
		url = merged.AssetURL()
	}

	if id == "" || url == "" {
		// related is not found, but it's ok to continue
		log.Infofc(ctx, "related dataset not found but it's ok to continue")
		return "", nil
	}

	path, err := downloadFileTo(ctx, url, dir)
	if err != nil {
		return "", fmt.Errorf("failed to download related dataset: %w", err)
	}

	if err := cw.UpdateDataItem(ctx, &GspatialjpDataItem{
		Related: id,
	}); err != nil {
		return "", fmt.Errorf("failed to update data item: %w", err)
	}

	log.Infofc(ctx, "related dataset downloaded: %s", path)
	return path, nil
}
