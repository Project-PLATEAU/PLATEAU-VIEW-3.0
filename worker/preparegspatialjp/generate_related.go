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
		return "", nil
	}

	item, err := cw.GetItem(ctx, cityItem.RelatedDataset, true)
	if err != nil {
		return "", err
	}

	if item == nil {
		return "", nil
	}

	var mergedv any
	if merged := item.FieldByKey("merged"); merged != nil {
		mergedv = merged.Value
	}

	v2, ok := mergedv.(map[string]any)
	if !ok {
		return "", nil
	}

	id, ok := v2["id"].(string)
	if !ok {
		return "", nil
	}

	url, ok := v2["url"].(string)
	if !ok {
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
