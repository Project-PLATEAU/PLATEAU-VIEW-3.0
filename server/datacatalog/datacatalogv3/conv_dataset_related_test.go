package datacatalogv3

import (
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestRelatedItem_ToDatasets(t *testing.T) {
	item := &RelatedItem{
		ID: "id",
		Items: map[string]RelatedItemDatum{
			"landmark": {
				Asset: []string{
					"https://example.com/11112_hoge-ku_city_2023_landmark.geojson",
					"https://example.com/11113_foo-ku_city_2023_landmark.geojson",
				},
				Converted: []string{
					"https://example.com/11112_hoge-ku_city_2023_landmark.czml",
					"https://example.com/11113_foo-ku_city_2023_landmark.czml",
				},
				Description: "desc1",
			},
			"border": {
				Asset:       []string{"https://example.com/11111_bar-shi_city_2023_border.geojson"},
				Description: "desc2",
			},
			"emergency_route": {
				Asset:       []string{"https://example.com/11111_bar-shi_city_2023_11112_hoge-ku_emergency_route.geojson"},
				Description: "desc3",
			},
		},
	}

	expected := []plateauapi.Dataset{
		&plateauapi.RelatedDataset{
			ID:                plateauapi.NewID("11112_landmark", plateauapi.TypeDataset),
			Name:              "ランドマーク情報（hoge区）",
			Description:       lo.EmptyableToPtr("desc1"),
			Year:              2023,
			RegisterationYear: 2023,
			OpenDataURL:       lo.EmptyableToPtr("https://www.geospatial.jp/ckan/dataset/plateau-11111-bar-shi-2023"),
			PrefectureID:      lo.ToPtr(plateauapi.NewID("11", plateauapi.TypePrefecture)),
			PrefectureCode:    lo.ToPtr(plateauapi.AreaCode("11")),
			CityID:            lo.ToPtr(plateauapi.NewID("11111", plateauapi.TypeCity)),
			CityCode:          lo.ToPtr(plateauapi.AreaCode("11111")),
			WardID:            lo.ToPtr(plateauapi.NewID("11112", plateauapi.TypeWard)),
			WardCode:          lo.ToPtr(plateauapi.AreaCode("11112")),
			TypeID:            plateauapi.NewID("landmark", plateauapi.TypeDatasetType),
			TypeCode:          "landmark",
			Admin: map[string]any{
				"cmsUrl": "https://example.com/id",
				"stage":  string(stageAlpha),
			},
			Items: []*plateauapi.RelatedDatasetItem{
				{
					ID:             plateauapi.NewID("11112_landmark", plateauapi.TypeDatasetItem),
					Name:           "ランドマーク情報",
					Format:         plateauapi.DatasetFormatCzml,
					URL:            "https://example.com/11112_hoge-ku_city_2023_landmark.czml",
					OriginalFormat: lo.ToPtr(plateauapi.DatasetFormatGeojson),
					OriginalURL:    lo.ToPtr("https://example.com/11112_hoge-ku_city_2023_landmark.geojson"),
					ParentID:       plateauapi.NewID("11112_landmark", plateauapi.TypeDataset),
				},
			},
		},
		&plateauapi.RelatedDataset{
			ID:                plateauapi.NewID("11113_landmark", plateauapi.TypeDataset),
			Name:              "ランドマーク情報（foo区）",
			Description:       lo.EmptyableToPtr("desc1"),
			Year:              2023,
			RegisterationYear: 2023,
			OpenDataURL:       lo.EmptyableToPtr("https://www.geospatial.jp/ckan/dataset/plateau-11111-bar-shi-2023"),
			PrefectureID:      lo.ToPtr(plateauapi.NewID("11", plateauapi.TypePrefecture)),
			PrefectureCode:    lo.ToPtr(plateauapi.AreaCode("11")),
			CityID:            lo.ToPtr(plateauapi.NewID("11111", plateauapi.TypeCity)),
			CityCode:          lo.ToPtr(plateauapi.AreaCode("11111")),
			WardID:            lo.ToPtr(plateauapi.NewID("11113", plateauapi.TypeWard)),
			WardCode:          lo.ToPtr(plateauapi.AreaCode("11113")),
			TypeID:            plateauapi.NewID("landmark", plateauapi.TypeDatasetType),
			TypeCode:          "landmark",
			Admin: map[string]any{
				"cmsUrl": "https://example.com/id",
				"stage":  string(stageAlpha),
			},
			Items: []*plateauapi.RelatedDatasetItem{
				{
					ID:             plateauapi.NewID("11113_landmark", plateauapi.TypeDatasetItem),
					Name:           "ランドマーク情報",
					Format:         plateauapi.DatasetFormatCzml,
					URL:            "https://example.com/11113_foo-ku_city_2023_landmark.czml",
					OriginalFormat: lo.ToPtr(plateauapi.DatasetFormatGeojson),
					OriginalURL:    lo.ToPtr("https://example.com/11113_foo-ku_city_2023_landmark.geojson"),
					ParentID:       plateauapi.NewID("11113_landmark", plateauapi.TypeDataset),
				},
			},
		},
		&plateauapi.RelatedDataset{
			ID:                plateauapi.NewID("11111_border", plateauapi.TypeDataset),
			Name:              "行政界情報（bar市）",
			Description:       lo.EmptyableToPtr("desc2"),
			Year:              2023,
			RegisterationYear: 2023,
			OpenDataURL:       lo.EmptyableToPtr("https://www.geospatial.jp/ckan/dataset/plateau-11111-bar-shi-2023"),
			PrefectureID:      lo.ToPtr(plateauapi.NewID("11", plateauapi.TypePrefecture)),
			PrefectureCode:    lo.ToPtr(plateauapi.AreaCode("11")),
			CityID:            lo.ToPtr(plateauapi.NewID("11111", plateauapi.TypeCity)),
			CityCode:          lo.ToPtr(plateauapi.AreaCode("11111")),
			TypeID:            plateauapi.NewID("border", plateauapi.TypeDatasetType),
			TypeCode:          "border",
			Admin: map[string]any{
				"cmsUrl": "https://example.com/id",
				"stage":  string(stageAlpha),
			},
			Items: []*plateauapi.RelatedDatasetItem{
				{
					ID:       plateauapi.NewID("11111_border", plateauapi.TypeDatasetItem),
					Format:   plateauapi.DatasetFormatGeojson,
					Name:     "行政界情報",
					URL:      "https://example.com/11111_bar-shi_city_2023_border.geojson",
					ParentID: plateauapi.NewID("11111_border", plateauapi.TypeDataset),
				},
			},
		},
		&plateauapi.RelatedDataset{
			ID:                plateauapi.NewID("11112_emergency_route", plateauapi.TypeDataset),
			Name:              "緊急輸送道路情報（hoge区）",
			Description:       lo.EmptyableToPtr("desc3"),
			Year:              2023,
			RegisterationYear: 2023,
			OpenDataURL:       lo.EmptyableToPtr("https://www.geospatial.jp/ckan/dataset/plateau-11111-bar-shi-2023"),
			PrefectureID:      lo.ToPtr(plateauapi.NewID("11", plateauapi.TypePrefecture)),
			PrefectureCode:    lo.ToPtr(plateauapi.AreaCode("11")),
			CityID:            lo.ToPtr(plateauapi.NewID("11111", plateauapi.TypeCity)),
			CityCode:          lo.ToPtr(plateauapi.AreaCode("11111")),
			WardID:            lo.ToPtr(plateauapi.NewID("11112", plateauapi.TypeWard)),
			WardCode:          lo.ToPtr(plateauapi.AreaCode("11112")),
			TypeID:            plateauapi.NewID("emergency_route", plateauapi.TypeDatasetType),
			TypeCode:          "emergency_route",
			Admin: map[string]any{
				"cmsUrl": "https://example.com/id",
				"stage":  string(stageAlpha),
			},
			Items: []*plateauapi.RelatedDatasetItem{
				{
					ID:       plateauapi.NewID("11112_emergency_route", plateauapi.TypeDatasetItem),
					Format:   plateauapi.DatasetFormatGeojson,
					Name:     "緊急輸送道路情報",
					URL:      "https://example.com/11111_bar-shi_city_2023_11112_hoge-ku_emergency_route.geojson",
					ParentID: plateauapi.NewID("11112_emergency_route", plateauapi.TypeDataset),
				},
			},
		},
	}

	area := &areaContext{
		Pref: &plateauapi.Prefecture{},
		City: &plateauapi.City{
			Name: "bar市",
			Code: "11111",
		},
		PrefID:   lo.ToPtr(plateauapi.NewID("11", plateauapi.TypePrefecture)),
		CityID:   lo.ToPtr(plateauapi.NewID("11111", plateauapi.TypeCity)),
		PrefCode: lo.ToPtr(plateauapi.AreaCode("11")),
		CityCode: lo.ToPtr(plateauapi.AreaCode("11111")),
		CityItem: &CityItem{
			ID:         "id",
			Year:       "2023年",
			CityCode:   "11111",
			CityNameEn: "bar-shi",
		},
		Wards: []*plateauapi.Ward{
			{
				ID:   plateauapi.NewID("11112", plateauapi.TypeWard),
				Code: plateauapi.AreaCode("11112"),
				Name: "hoge区",
			},
			{
				ID:   plateauapi.NewID("11113", plateauapi.TypeWard),
				Code: plateauapi.AreaCode("11113"),
				Name: "foo区",
			},
		},
	}

	dts := []plateauapi.DatasetType{
		&plateauapi.RelatedDatasetType{
			ID:   plateauapi.NewID("landmark", plateauapi.TypeDatasetType),
			Code: "landmark",
			Name: "ランドマーク情報",
		},
		&plateauapi.RelatedDatasetType{
			ID:   plateauapi.NewID("border", plateauapi.TypeDatasetType),
			Code: "border",
			Name: "行政界情報",
		},
		&plateauapi.RelatedDatasetType{
			ID:   plateauapi.NewID("emergency_route", plateauapi.TypeDatasetType),
			Code: "emergency_route",
			Name: "緊急輸送道路情報",
		},
	}

	res, warnings := item.toDatasets(area, dts, 2023, "https://example.com/")
	assert.Nil(t, warnings)
	assert.Equal(t, expected, res)
}
