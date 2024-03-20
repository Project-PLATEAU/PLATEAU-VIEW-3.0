package datacatalogv2

import (
	"testing"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/stretchr/testify/assert"
)

func TestUsecaseItem_DataCatalogs(t *testing.T) {
	assert.Equal(t, []DataCatalogItem{{
		ID:       "id",
		Type:     "ユースケース",
		TypeEn:   "usecase",
		URL:      "url",
		City:     "city",
		Ward:     "ward",
		Year:     2023,
		RootType: true,
		Category: "aaa",
		Family:   "generic",
		Edition:  "2022",
	}}, UsecaseItem{
		ID:       "id",
		DataURL:  "url2",
		CityName: "city",
		WardName: "ward",
		Data: &cms.PublicAsset{
			Asset: cms.Asset{
				URL: "url",
			},
		},
		Year:     "2023年度",
		Category: "aaa",
	}.DataCatalogs())

	assert.Equal(t, []DataCatalogItem{{
		ID:       "id",
		Type:     "あああ",
		TypeEn:   "あああ",
		City:     "city",
		RootType: true,
		Category: "ユースケース",
		Family:   "generic",
		Edition:  "2022",
	}}, UsecaseItem{
		ID:       "id",
		Type:     "あああ",
		CityName: "city",
	}.DataCatalogs())

	assert.Equal(t, []DataCatalogItem{{
		ID:       "id",
		Type:     "あああ",
		TypeEn:   "aaa",
		City:     "city",
		RootType: true,
		Category: "cat",
		Family:   "generic",
		Edition:  "2022",
	}}, UsecaseItem{
		ID:       "id",
		Type:     "あああ",
		TypeEn:   "aaa",
		CityName: "city",
		Category: "cat",
	}.DataCatalogs())

	assert.Equal(t, []DataCatalogItem{{
		ID:       "id",
		Type:     "フォルダ",
		TypeEn:   "folder",
		Name:     "name",
		Pref:     "大阪府",
		PrefCode: "27",
		City:     "大阪市",
		CityCode: "27100",
		Ward:     "北区",
		WardCode: "27127",
		Family:   "generic",
		Edition:  "2022",
	}}, UsecaseItem{
		ID:         "id",
		Name:       "name",
		Prefecture: "大阪府",
		CityName:   "大阪市/北区",
		DataFormat: "フォルダ",
	}.DataCatalogs())
}
