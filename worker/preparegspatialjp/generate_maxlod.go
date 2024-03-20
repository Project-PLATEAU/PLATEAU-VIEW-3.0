package preparegspatialjp

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"os"

	"github.com/reearth/reearthx/log"
)

func PrepareMaxLOD(ctx context.Context, cw *CMSWrapper, mc MergeContext) (err error) {
	defer func() {
		if err == nil {
			return
		}
		err = fmt.Errorf("最大LODのマージに失敗しました: %w", err)
		cw.NotifyError(ctx, err, false, false, true)
	}()

	tmpDir := mc.TmpDir
	cityItem := mc.CityItem
	allFeatureItems := mc.AllFeatureItems

	log.Infofc(ctx, "preparing maxlod...")

	_ = os.MkdirAll(tmpDir, os.ModePerm)

	fileName := fmt.Sprintf("%s_%s_%d_maxlod.csv", cityItem.CityCode, cityItem.CityNameEn, cityItem.YearInt())

	allData := bytes.NewBuffer(nil)

	first := false
	for _, ft := range featureTypes {
		fi, ok := allFeatureItems[ft]
		if !ok || fi.MaxLOD == "" {
			log.Infofc(ctx, "no maxlod for %s", ft)
			continue
		}

		log.Infofc(ctx, "downloading maxlod data for %s: %s", ft, fi.MaxLOD)
		data, err := downloadFile(ctx, fi.MaxLOD)
		if err != nil {
			return fmt.Errorf("failed to download data for %s: %w", ft, err)
		}

		b := bufio.NewReader(data)
		if first {
			if line, err := b.ReadString('\n'); err != nil { // skip the first line
				return fmt.Errorf("failed to read first line: %w", err)
			} else if line == "" || isNumeric(rune(line[0])) {
				// the first line shold be header (code,type,maxlod,filename)
				return fmt.Errorf("invalid maxlod data for %s", ft)
			}
		} else {
			first = true
		}

		if _, err := allData.ReadFrom(b); err != nil {
			return fmt.Errorf("failed to read data for %s: %w", ft, err)
		}
	}

	r := bytes.NewReader(allData.Bytes())
	aid, err := cw.Upload(ctx, fileName, r)
	if err != nil {
		return fmt.Errorf("failed to upload maxlod data: %w", err)
	}

	if err := cw.UpdateDataItem(ctx, &GspatialjpDataItem{
		MergeMaxLODStatus: successTag,
		MaxLOD:            aid,
	}); err != nil {
		return fmt.Errorf("failed to update data item: %w", err)
	}

	log.Infofc(ctx, "maxlod prepared: %s", fileName)
	return nil
}
