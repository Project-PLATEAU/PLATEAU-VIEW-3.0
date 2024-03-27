package datacatalogv2adapter

import (
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewCache(t *testing.T) {
	r := datacatalogv2.ResponseAll{
		Plateau: []datacatalogv2.PlateauItem{
			{
				ID:              "plateau1",
				Prefecture:      "北海道",
				CityName:        "hoge市",
				DescriptionBldg: "bldg_desc",
				Specification:   "第2.3版",
				CityGML: &cms.PublicAsset{
					Asset: cms.Asset{
						ID:  "assetid",
						URL: "https://example.com/00000_hoge-shi_2022_citygml_op.zip",
					},
				},
				Bldg: []*cms.PublicAsset{
					{
						Asset: cms.Asset{
							URL: "https://example.com/00000_hoge-shi_2022_3dtiles_0_bldg_lod1.zip",
						},
					},
				},
				MaxLOD: &cms.PublicAsset{
					Asset: cms.Asset{
						URL: "maxlod",
					},
				},
			},
		},
	}

	all := r.All()

	items := map[string]*fetcherPlateauItem2{
		"plateau1": {
			ID:             "plateau1",
			CityGMLURL:     "https://example.com/00000_hoge-shi_2022_citygml_op_2.zip",
			CityGMLAssetID: "assetid2",
			MaxLODURL:      "maxlod2",
			FeatureTypes:   []string{"bldg", "dem"},
			SDKPublic:      true,
		},
	}

	expectedCache := &plateauapi.InMemoryRepoContext{
		Areas: plateauapi.Areas{
			plateauapi.AreaTypePrefecture: []plateauapi.Area{
				&plateauapi.Prefecture{
					Type: plateauapi.AreaTypePrefecture,
					ID:   "p_01",
					Name: "北海道",
					Code: plateauapi.AreaCode("01"),
				},
			},
			plateauapi.AreaTypeCity: []plateauapi.Area{
				&plateauapi.City{
					Type:           plateauapi.AreaTypeCity,
					ID:             "c_00000",
					Name:           "hoge市",
					Code:           plateauapi.AreaCode("00000"),
					PrefectureID:   plateauapi.ID("p_01"),
					PrefectureCode: plateauapi.AreaCode("01"),
					CitygmlID:      lo.ToPtr(plateauapi.ID("cg_00000")),
				},
			},
		},
		DatasetTypes: plateauapi.DatasetTypes{
			plateauapi.DatasetTypeCategoryPlateau: []plateauapi.DatasetType{
				&plateauapi.PlateauDatasetType{
					ID:            "dt_bldg_2",
					Code:          "bldg",
					Name:          "建築物モデル",
					Category:      plateauapi.DatasetTypeCategoryPlateau,
					PlateauSpecID: "ps_2",
					Year:          2022,
					Flood:         false,
					Order:         1,
				},
			},
			plateauapi.DatasetTypeCategoryGeneric: []plateauapi.DatasetType{
				sampleDataType,
			},
		},
		Datasets: plateauapi.Datasets{
			plateauapi.DatasetTypeCategoryPlateau: []plateauapi.Dataset{
				&plateauapi.PlateauDataset{
					ID:                 "d_00000_bldg",
					Name:               "建築物モデル（hoge市）",
					Year:               2022,
					RegisterationYear:  2022,
					OpenDataURL:        lo.ToPtr("https://www.geospatial.jp/ckan/dataset/plateau-00000-hoge-shi-2022"),
					Description:        lo.ToPtr("bldg_desc"),
					PrefectureID:       lo.ToPtr(plateauapi.ID("p_01")),
					PrefectureCode:     lo.ToPtr(plateauapi.AreaCode("01")),
					CityID:             lo.ToPtr(plateauapi.ID("c_00000")),
					CityCode:           lo.ToPtr(plateauapi.AreaCode("00000")),
					TypeID:             "dt_bldg_2",
					TypeCode:           "bldg",
					PlateauSpecMinorID: "ps_2.3",
					Items: []*plateauapi.PlateauDatasetItem{
						{
							ID:       "di_00000_bldg_LOD1",
							URL:      "https://example.com/00000_hoge-shi_2022_3dtiles_0_bldg_lod1/tileset.json",
							Format:   plateauapi.DatasetFormatCesium3dtiles,
							Name:     "LOD1",
							ParentID: "d_00000_bldg",
							Lod:      lo.ToPtr(1),
							Texture:  lo.ToPtr(plateauapi.TextureTexture),
						},
					},
				},
			},
		},
		CityGML: map[plateauapi.ID]*plateauapi.CityGMLDataset{
			"cg_00000": {
				ID:                 "cg_00000",
				Year:               2022,
				RegistrationYear:   2022,
				PrefectureID:       "p_01",
				PrefectureCode:     "01",
				CityID:             "c_00000",
				CityCode:           "00000",
				PlateauSpecMinorID: "ps_2.3",
				URL:                "https://example.com/00000_hoge-shi_2022_citygml_op_2.zip",
				FeatureTypes:       []string{"bldg", "dem"},
				Admin: map[string]any{
					"citygmlUrl":     []string{"https://example.com/00000_hoge-shi_2022_citygml_op_2.zip"},
					"maxlod":         []string{"maxlod2"},
					"citygmlAssetId": "assetid2",
				},
			},
		},
		Years: []int{
			2022,
		},
		PlateauSpecs: plateauSpecs,
	}

	cache := newCache(all, items)
	assert.Equal(t, expectedCache, cache)
}
