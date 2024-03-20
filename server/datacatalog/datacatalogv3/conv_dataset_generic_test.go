package datacatalogv3

import (
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_GenericItem_ToDatasets(t *testing.T) {
	item := &GenericItem{
		ID:          "id",
		Name:        "name",
		Desc:        "desc",
		OpenDataURL: "https://example.com",
		Items: []GenericItemDataset{
			{
				ID:         "id1",
				Name:       "name1",
				Data:       "url1",
				Desc:       "desc1",
				DataFormat: "3D Tiles",
			},
			{
				ID:         "id2",
				Data:       "url2",
				DataFormat: "MVT",
				DataURL:    "https://example.com/a.zip",
				Desc:       "desc2",
				LayerName:  "layer1, layer2",
			},
			// invalid item
			{
				ID: "id3",
			},
		},
		Category: "ユースケース",
	}

	expected := []plateauapi.Dataset{
		&plateauapi.GenericDataset{
			ID:                plateauapi.NewID("id", plateauapi.TypeDataset),
			Name:              "name",
			Description:       lo.EmptyableToPtr("desc"),
			Year:              2023,
			RegisterationYear: 2023,
			OpenDataURL:       lo.EmptyableToPtr("https://example.com"),
			PrefectureID:      lo.ToPtr(plateauapi.NewID("11", plateauapi.TypePrefecture)),
			PrefectureCode:    lo.ToPtr(plateauapi.AreaCode("11")),
			CityID:            lo.ToPtr(plateauapi.NewID("11111", plateauapi.TypeCity)),
			CityCode:          lo.ToPtr(plateauapi.AreaCode("11111")),
			TypeID:            plateauapi.NewID("usecase", plateauapi.TypeDatasetType),
			TypeCode:          "usecase",
			Admin: map[string]any{
				"cmsUrl": "https://example.com/id",
				"stage":  string(stageAlpha),
			},
			Items: []*plateauapi.GenericDatasetItem{
				{
					ID:       plateauapi.NewID("id1", plateauapi.TypeDatasetItem),
					Name:     "name1",
					URL:      "url1",
					Format:   plateauapi.DatasetFormatCesium3dtiles,
					ParentID: plateauapi.NewID("id", plateauapi.TypeDataset),
				},
				{
					ID:       plateauapi.NewID("id2", plateauapi.TypeDatasetItem),
					Name:     "name 2",
					URL:      "https://example.com/a/{z}/{x}/{y}.mvt",
					Format:   plateauapi.DatasetFormatMvt,
					Layers:   []string{"layer1", "layer2"},
					ParentID: plateauapi.NewID("id", plateauapi.TypeDataset),
				},
			},
		},
	}

	area := &areaContext{
		PrefID:   lo.ToPtr(plateauapi.NewID("11", plateauapi.TypePrefecture)),
		PrefCode: lo.ToPtr(plateauapi.AreaCode("11")),
		CityID:   lo.ToPtr(plateauapi.NewID("11111", plateauapi.TypeCity)),
		CityCode: lo.ToPtr(plateauapi.AreaCode("11111")),
		CityItem: &CityItem{
			ID:   "id",
			Year: "令和5年度",
		},
	}

	dts := []plateauapi.DatasetType{
		&plateauapi.GenericDatasetType{
			ID:   plateauapi.NewID("usecase", plateauapi.TypeDatasetType),
			Code: "usecase",
			Name: "ユースケース",
		},
	}

	res, warning := item.toDatasets(area, dts, 2023, "https://example.com/")
	assert.Equal(t, []string{"generic id[2]: invalid url: "}, warning)
	assert.Equal(t, expected, res)
}
