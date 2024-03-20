package datacatalogv2

import (
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2/plateauv2"
	"github.com/samber/lo"
)

// Currently this is almost the same as UseCaseItem
type DatasetItem plateauv2.DatasetItem

var _ ItemCommon = &DatasetItem{}

func (i DatasetItem) GetCityName() string {
	return plateauv2.DatasetItem(i).GetCityName()
}

func (i DatasetItem) DataCatalogs() []DataCatalogItem {
	return lo.Map(plateauv2.DatasetItem(i).DataCatalogs(), dataCatalogItemFromPlateauV2)
}
