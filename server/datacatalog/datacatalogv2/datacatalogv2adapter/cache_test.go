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
				Prefecture:      "東京都",
				CityName:        "東京都23区",
				DescriptionBldg: "bldg_desc",
				Specification:   "第2.3版",
				CityGML: &cms.PublicAsset{
					Asset: cms.Asset{
						ID:  "assetid",
						URL: "https://example.com/13101_tokyo23ku_2022_citygml_op.zip",
					},
				},
				Bldg: []*cms.PublicAsset{
					{
						Asset: cms.Asset{
							URL: "https://example.com/13101_tokyo23ku_2022_3dtiles_0_bldg_lod1.zip",
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
			CityGMLURL:     "https://example.com/13101_tokyo23ku_2022_citygml_op_2.zip",
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
					ID:   "p_13",
					Name: "東京都",
					Code: plateauapi.AreaCode("13"),
				},
			},
			plateauapi.AreaTypeCity: []plateauapi.Area{
				&plateauapi.City{
					Type:           plateauapi.AreaTypeCity,
					ID:             "c_13101",
					Name:           "東京都23区",
					Code:           plateauapi.AreaCode("13101"),
					PrefectureID:   plateauapi.ID("p_13"),
					PrefectureCode: plateauapi.AreaCode("13"),
					CitygmlID:      lo.ToPtr(plateauapi.ID("cg_13101")),
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
		},
		Datasets: plateauapi.Datasets{
			plateauapi.DatasetTypeCategoryPlateau: []plateauapi.Dataset{
				&plateauapi.PlateauDataset{
					ID:                 "d_13101_bldg",
					Name:               "建築物モデル（東京都23区）",
					Year:               2022,
					RegisterationYear:  2022,
					OpenDataURL:        lo.ToPtr("https://www.geospatial.jp/ckan/dataset/plateau-13101-tokyo23ku-2022"),
					Description:        lo.ToPtr("bldg_desc"),
					PrefectureID:       lo.ToPtr(plateauapi.ID("p_13")),
					PrefectureCode:     lo.ToPtr(plateauapi.AreaCode("13")),
					CityID:             lo.ToPtr(plateauapi.ID("c_13101")),
					CityCode:           lo.ToPtr(plateauapi.AreaCode("13101")),
					TypeID:             "dt_bldg_2",
					TypeCode:           "bldg",
					PlateauSpecMinorID: "ps_2.3",
					Items: []*plateauapi.PlateauDatasetItem{
						{
							ID:       "di_13101_bldg_LOD1",
							URL:      "https://example.com/13101_tokyo23ku_2022_3dtiles_0_bldg_lod1/tileset.json",
							Format:   plateauapi.DatasetFormatCesium3dtiles,
							Name:     "LOD1",
							ParentID: "d_13101_bldg",
							Lod:      lo.ToPtr(1),
							Texture:  lo.ToPtr(plateauapi.TextureTexture),
						},
					},
				},
			},
		},
		CityGML: map[plateauapi.ID]*plateauapi.CityGMLDataset{
			"cg_13101": {
				ID:                 "cg_13101",
				Year:               2022,
				RegistrationYear:   2022,
				PrefectureID:       "p_13",
				PrefectureCode:     "13",
				CityID:             "c_13101",
				CityCode:           "13101",
				PlateauSpecMinorID: "ps_2.3",
				URL:                "https://example.com/13101_tokyo23ku_2022_citygml_op_2.zip",
				FeatureTypes:       []string{"bldg", "dem"},
				Admin: map[string]any{
					"citygmlUrl":     []string{"https://example.com/13101_tokyo23ku_2022_citygml_op_2.zip"},
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
