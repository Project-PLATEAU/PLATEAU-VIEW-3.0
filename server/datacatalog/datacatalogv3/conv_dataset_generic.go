package datacatalogv3

import (
	"fmt"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/samber/lo"
)

func (i *GenericItem) toDatasets(area *areaContext, dts []plateauapi.DatasetType, year int, cmsurl string) (_ []plateauapi.Dataset, warning []string) {
	if area == nil {
		area = &areaContext{}
	}

	id := plateauapi.NewID(i.ID, plateauapi.TypeDataset)

	dt, _ := lo.Find(dts, func(dt plateauapi.DatasetType) bool {
		return dt.GetName() == i.Category
	})
	if dt == nil {
		warning = append(warning, fmt.Sprintf("generic %s: dataset type not found: %s", i.ID, i.Category))
		return
	}

	items := lo.FilterMap(i.Items, func(datum GenericItemDataset, ind int) (*plateauapi.GenericDatasetItem, bool) {
		url := datum.DataURL
		if url == "" {
			url = datum.Data
		}
		f := datasetFormatFromOrDetect(datum.DataFormat, url)
		if url == "" || f == "" {
			warning = append(warning, fmt.Sprintf("generic %s[%d]: invalid url: %s", i.ID, ind, url))
			return nil, false
		}

		var inds string
		if len(i.Items) > 1 {
			inds = fmt.Sprintf(" %d", ind+1)
		}

		return &plateauapi.GenericDatasetItem{
			ID:       plateauapi.NewID(datum.ID, plateauapi.TypeDatasetItem),
			Name:     firstNonEmptyValue(datum.Name, fmt.Sprintf("%s%s", i.Name, inds)),
			URL:      assetURLFromFormat(url, f),
			Format:   f,
			Layers:   layerNamesFrom(datum.LayerName),
			ParentID: id,
		}, true
	})

	var groups []string
	if i.Group != "" {
		groups = strings.Split(i.Group, "/")
	}

	res := plateauapi.GenericDataset{
		ID:                id,
		Name:              standardItemName(i.Name, "", area.Name()),
		Description:       lo.EmptyableToPtr(i.Desc),
		Year:              year,
		RegisterationYear: year,
		OpenDataURL:       lo.EmptyableToPtr(i.OpenDataURL),
		PrefectureID:      area.PrefID,
		PrefectureCode:    area.PrefCode,
		CityID:            area.CityID,
		CityCode:          area.CityCode,
		TypeID:            dt.GetID(),
		TypeCode:          dt.GetCode(),
		Groups:            groups,
		Admin:             newAdmin(i.ID, i.Stage(), cmsurl, nil),
		Items:             items,
	}

	return []plateauapi.Dataset{&res}, warning
}
