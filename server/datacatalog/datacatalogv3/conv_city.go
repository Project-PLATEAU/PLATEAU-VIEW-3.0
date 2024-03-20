package datacatalogv3

import (
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/samber/lo"
)

func (city *CityItem) ToPrefecture() *plateauapi.Prefecture {
	if city == nil || len(city.CityCode) < 2 || !city.IsPublicOrBeta() {
		return nil
	}

	prefCode := city.CityCode[:2]
	if prefCode == "" {
		return nil
	}

	return &plateauapi.Prefecture{
		ID:   plateauapi.NewID(prefCode, plateauapi.TypePrefecture),
		Name: city.Prefecture,
		Code: plateauapi.AreaCode(prefCode),
		Type: plateauapi.AreaTypePrefecture,
	}
}

func (city *CityItem) ToCity() *plateauapi.City {
	if city == nil || city.CityName == "" || len(city.CityCode) < 2 || !city.IsPublicOrBeta() {
		return nil
	}

	prefCode := city.CityCode[:2]
	return &plateauapi.City{
		ID:                plateauapi.NewID(city.CityCode, plateauapi.TypeCity),
		Name:              city.CityName,
		Code:              plateauapi.AreaCode(city.CityCode),
		Type:              plateauapi.AreaTypeCity,
		PrefectureID:      plateauapi.NewID(prefCode, plateauapi.TypePrefecture),
		PrefectureCode:    plateauapi.AreaCode(prefCode),
		PlanarCrsEpsgCode: lo.EmptyableToPtr(city.PlanarCrsEpsgCode()),
		CitygmlID:         lo.ToPtr(plateauapi.CityGMLDatasetIDFrom(plateauapi.AreaCode(city.CityCode))),
	}
}
