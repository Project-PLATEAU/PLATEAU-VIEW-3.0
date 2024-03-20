package plateauv2

import (
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2/datacatalogutil"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestBldg(t *testing.T) {
	// case1: multiple wards
	i := CMSItem{
		ID:              "id",
		Prefecture:      "北海道",
		CityName:        "札幌市",
		CityGML:         urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionBldg: "説明",
		OpenDataURL:     "https://example.com",
		Bldg: []*cms.PublicAsset{
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01101_chuo-ku_lod2.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01101_chuo-ku_lod1.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01102_kita-ku_lod1.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01102_kita-ku_lod1_no_texture.zip"),
		},
		SearchIndex: []*cms.PublicAsset{

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01101_chuo-ku_index.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01102_kita-ku_index.zip"),
		},
		Dic: `{"admin":[{"name":"chuo-ku","code":"01101","description":"中央区"},{"name":"kita-ku","code":"01102","description":"北区"}]}`,
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_01101_chuo-ku_bldg",
			ItemID:              "id",
			Name:                "建築物モデル（中央区）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Ward:                "中央区",
			WardEn:              "chuo-ku",
			WardCode:            "01101",
			Type:                "建築物モデル",
			TypeEn:              "bldg",
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01101_chuo-ku_lod2/tileset.json",
			Format:              "3dtiles",
			SearchIndex:         "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01101_chuo-ku_index/indexRoot.json",
			Year:                2020,
			OpenDataURL:         "https://example.com",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"bldg"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "LOD1",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01101_chuo-ku_lod1/tileset.json",
						Type: "3dtiles",
					},
					{
						Name: "LOD2",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01101_chuo-ku_lod2/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
		{
			ID:                  "01100_sapporo-shi_01102_kita-ku_bldg",
			Name:                "建築物モデル（北区）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Ward:                "北区",
			WardEn:              "kita-ku",
			WardCode:            "01102",
			Type:                "建築物モデル",
			TypeEn:              "bldg",
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01102_kita-ku_lod1/tileset.json",
			Format:              "3dtiles",
			SearchIndex:         "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01102_kita-ku_index/indexRoot.json",
			Year:                2020,
			OpenDataURL:         "https://example.com",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"bldg"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "LOD1",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01102_kita-ku_lod1/tileset.json",
						Type: "3dtiles",
					},
					{
						Name: "LOD1（テクスチャなし）",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_01102_kita-ku_lod1_no_texture/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "bldg"))

	// case2: normal city
	i = CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),

		DescriptionBldg: "説明",
		OpenDataURL:     "https://example.com",
		Bldg: []*cms.PublicAsset{

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_lod1.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_lod2.zip"),
		},
		SearchIndex: []*cms.PublicAsset{

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_index.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_bldg",
			ItemID:              "id",
			Name:                "建築物モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "建築物モデル",
			TypeEn:              "bldg",
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_lod2/tileset.json",
			Format:              "3dtiles",
			SearchIndex:         "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_index/indexRoot.json",
			Year:                2020,
			OpenDataURL:         "https://example.com",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"bldg"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "LOD1",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_lod1/tileset.json",
						Type: "3dtiles",
					},
					{
						Name: "LOD2",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_bldg_lod2/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "bldg"))
}

func TestTran(t *testing.T) {
	i := CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),

		DescriptionTran: "説明",
		OpenDataURL:     "https://example.com",
		Tran: []*cms.PublicAsset{

			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_op_tran_lod1.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_op_tran_lod2.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_tran_lod3.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_tran",
			Name:                "道路モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "道路モデル",
			TypeEn:              "tran",
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_tran_lod3/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"tran"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name:   "LOD1",
						URL:    "https://example.com/01100_sapporo-shi_2020_mvt_op_tran_lod1/{z}/{x}/{y}.mvt",
						Type:   "mvt",
						Layers: []string{"Road"},
					},
					{
						Name:   "LOD2",
						URL:    "https://example.com/01100_sapporo-shi_2020_mvt_op_tran_lod2/{z}/{x}/{y}.mvt",
						Type:   "mvt",
						Layers: []string{"TrafficArea", "AuxiliaryTrafficArea"},
					},
					{
						Name: "LOD3",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_tran_lod3/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "tran"))

	i = CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),

		DescriptionTran: "説明",
		OpenDataURL:     "https://example.com",
		Tran: []*cms.PublicAsset{

			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_op_tran_lod1.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_tran",
			Name:                "道路モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "道路モデル",
			TypeEn:              "tran",
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_mvt_op_tran_lod1/{z}/{x}/{y}.mvt",
			OpenDataURL:         "https://example.com",
			Format:              "mvt",
			Layers:              []string{"Road"},
			Year:                2020,
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"tran"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name:   "LOD1",
						URL:    "https://example.com/01100_sapporo-shi_2020_mvt_op_tran_lod1/{z}/{x}/{y}.mvt",
						Type:   "mvt",
						Layers: []string{"Road"},
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "tran"))
}

func TestFrn(t *testing.T) {
	// case1: multiple LODs
	i := CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),

		DescriptionFrn: "説明",
		OpenDataURL:    "https://example.com",
		Frn: []*cms.PublicAsset{

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_frn_lod1.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_frn_lod3.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_frn",
			Name:                "都市設備モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "都市設備モデル",
			TypeEn:              "frn",
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_frn_lod1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"frn"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "LOD1",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_frn_lod1/tileset.json",
						Type: "3dtiles",
					},
					{
						Name: "LOD3",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_frn_lod3/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "frn"))

	// case2: no LOD
	i = CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),

		DescriptionFrn: "説明",
		OpenDataURL:    "https://example.com",
		Frn: []*cms.PublicAsset{

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_frn.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_frn",
			Name:                "都市設備モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "都市設備モデル",
			TypeEn:              "frn",
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_frn/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"frn"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "都市設備モデル",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_frn/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "frn"))
}

func TestVeg(t *testing.T) {
	// case1: multiple LODs
	i := CMSItem{
		ID:             "id",
		Prefecture:     "北海道",
		CityName:       "札幌市",
		CityGML:        urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionVeg: "説明",
		OpenDataURL:    "https://example.com",
		Veg: []*cms.PublicAsset{
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_veg_lod1.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_veg_lod3.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_veg",
			Name:                "植生モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "植生モデル",
			TypeEn:              "veg",
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_veg_lod1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"veg"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "LOD1",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_veg_lod1/tileset.json",
						Type: "3dtiles",
					},
					{
						Name: "LOD3",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_veg_lod3/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "veg"))

	// case2: no LOD
	i = CMSItem{
		ID:             "id",
		Prefecture:     "北海道",
		CityName:       "札幌市",
		CityGML:        urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionVeg: "説明",
		OpenDataURL:    "https://example.com",
		Veg: []*cms.PublicAsset{
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_veg.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_veg",
			Name:                "植生モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "植生モデル",
			TypeEn:              "veg",
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_veg/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"veg"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "植生モデル",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_veg/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "veg"))
}

func TestLuse(t *testing.T) {
	i := CMSItem{
		ID:              "id",
		Prefecture:      "北海道",
		CityName:        "札幌市",
		CityGML:         urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionLuse: "説明",
		OpenDataURL:     "https://example.com",
		Luse: []*cms.PublicAsset{
			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_op_luse.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_luse",
			Name:                "土地利用モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "土地利用モデル",
			TypeEn:              "luse",
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_mvt_op_luse/{z}/{x}/{y}.mvt",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "mvt",
			Layers:              []string{"luse"},
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"luse"},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "luse"))
}

func TestLsld(t *testing.T) {
	i := CMSItem{
		ID:              "id",
		Prefecture:      "北海道",
		CityName:        "札幌市",
		CityGML:         urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionLsld: "説明",
		OpenDataURL:     "https://example.com",
		Lsld: []*cms.PublicAsset{
			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_op_lsld.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_lsld",
			Name:                "土砂災害警戒区域モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "土砂災害警戒区域モデル",
			TypeEn:              "lsld",
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_mvt_op_lsld/{z}/{x}/{y}.mvt",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "mvt",
			Layers:              []string{"lsld"},
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"lsld"},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "lsld"))
}

func TestUrf(t *testing.T) {
	i := CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionUrf: []string{
			"01100_sapporo-shi_2020_mvt_op_urf_QuasiUrbanPlanningArea.zip\n説明1",
			"01100_sapporo-shi_2020_mvt_op_urf_AreaClassification.zip\n\n説明2",
		},
		OpenDataURL: "https://example.com",
		Urf: []*cms.PublicAsset{
			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_op_urf_AreaClassification.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_op_urf_QuasiUrbanPlanningArea.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_op_urf_DistrictsAndZones.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_op_urf_XXX.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_urf_QuasiUrbanPlanningArea",
			Name:                "準都市計画区域モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "都市計画決定情報モデル",
			TypeEn:              "urf",
			Type2:               "準都市計画区域",
			Type2En:             "QuasiUrbanPlanningArea",
			Description:         "説明1",
			URL:                 "https://example.com/01100_sapporo-shi_2020_mvt_op_urf_QuasiUrbanPlanningArea/{z}/{x}/{y}.mvt",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "mvt",
			Layers:              []string{"QuasiUrbanPlanningArea"},
			RootType:            true,
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"urf"},
		},
		{
			ID:                  "01100_sapporo-shi_urf_AreaClassification",
			Name:                "区域区分モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "都市計画決定情報モデル",
			TypeEn:              "urf",
			Type2:               "区域区分",
			Type2En:             "AreaClassification",
			Description:         "説明2",
			URL:                 "https://example.com/01100_sapporo-shi_2020_mvt_op_urf_AreaClassification/{z}/{x}/{y}.mvt",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "mvt",
			Layers:              []string{"AreaClassification"},
			RootType:            true,
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"urf"},
		},
		{
			ID:                  "01100_sapporo-shi_urf_DistrictsAndZones",
			Name:                "地域地区モデル（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "都市計画決定情報モデル",
			TypeEn:              "urf",
			Type2:               "地域地区",
			Type2En:             "DistrictsAndZones",
			URL:                 "https://example.com/01100_sapporo-shi_2020_mvt_op_urf_DistrictsAndZones/{z}/{x}/{y}.mvt",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "mvt",
			Layers:              []string{"DistrictsAndZones"},
			RootType:            true,
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"urf"},
		},
		{
			ID:                  "01100_sapporo-shi_urf_XXX",
			Name:                "XXX（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "都市計画決定情報モデル",
			TypeEn:              "urf",
			Type2:               "XXX",
			Type2En:             "XXX",
			URL:                 "https://example.com/01100_sapporo-shi_2020_mvt_op_urf_XXX/{z}/{x}/{y}.mvt",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "mvt",
			Layers:              []string{"XXX"},
			RootType:            true,
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"urf"},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "urf"))
}

func TestFld(t *testing.T) {
	i := CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionFld: []string{
			"01100_sapporo-shi_2020_3dtiles_op_fld_natl_shikarigawa_toyohiragawa_l1\n説明1",
			"01100_sapporo-shi_2020_3dtiles_op_fld_pref_shinkawa_shinkawa_l1.zip\n\n説明2",
		},
		OpenDataURL: "https://example.com",
		Fld: []*cms.PublicAsset{

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_natl_shinkawa_shinkawa_l2.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_pref_shinkawa_shinkawa_l1.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_natl_shikarigawa_toyohiragawa_l1.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_natl_shinkawa_shinkawa_l1.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_natl_shikarigawa_toyohiragawa_l2.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_pref_shinkawa_shinkawa_l2.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_pref_zfoobar_l2.zip"),
		},
		Dic: `{"fld":[
			{ "name":"shikarigawa_toyohiragawa_l1", "admin": "国", "description":"石狩川水系豊平川", "scale":"計画規模" },
			{ "name":"shikarigawa_toyohiragawa_l2", "admin": "国", "description":"石狩川水系豊平川", "scale":"想定最大規模" },
			{ "name":"shinkawa_shinkawa_l1", "admin": "国", "description":"新川水系新川", "scale":"計画規模" },
			{ "name":"shinkawa_shinkawa_l2", "admin": "国", "description":"新川水系新川", "scale":"想定最大規模" },
			{ "name":"shinkawa_shinkawa_l1", "admin": "都道府県", "description":"新川水系新川", "scale":"計画規模" },
			{ "name":"shinkawa_shinkawa_l2", "admin": "都道府県", "description":"新川水系新川", "scale":"想定最大規模" },
			{ "name":"zfoobar_l2", "admin": "都道府県", "description":"zfoobar", "scale":"想定最大規模" }
		]}`,
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_fld_natl_shikarigawa_toyohiragawa_l1",
			Name:                "洪水浸水想定区域モデル 石狩川水系豊平川（国管理区間）（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "洪水浸水想定区域モデル",
			TypeEn:              "fld",
			RootType:            true,
			Description:         "説明1",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_natl_shikarigawa_toyohiragawa_l1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"fld"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "計画規模",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_natl_shikarigawa_toyohiragawa_l1/tileset.json",
						Type: "3dtiles",
					},
					{
						Name: "想定最大規模",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_natl_shikarigawa_toyohiragawa_l2/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
		{
			ID:                  "01100_sapporo-shi_fld_natl_shinkawa_shinkawa_l1",
			Name:                "洪水浸水想定区域モデル 新川水系新川（国管理区間）（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "洪水浸水想定区域モデル",
			TypeEn:              "fld",
			RootType:            true,
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_natl_shinkawa_shinkawa_l1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"fld"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "計画規模",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_natl_shinkawa_shinkawa_l1/tileset.json",
						Type: "3dtiles",
					},
					{
						Name: "想定最大規模",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_natl_shinkawa_shinkawa_l2/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
		{
			ID:                  "01100_sapporo-shi_fld_pref_shinkawa_shinkawa_l1",
			Name:                "洪水浸水想定区域モデル 新川水系新川（都道府県管理区間）（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "洪水浸水想定区域モデル",
			TypeEn:              "fld",
			RootType:            true,
			Description:         "説明2",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_pref_shinkawa_shinkawa_l1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"fld"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "計画規模",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_pref_shinkawa_shinkawa_l1/tileset.json",
						Type: "3dtiles",
					},
					{
						Name: "想定最大規模",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_pref_shinkawa_shinkawa_l2/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
		{
			ID:                  "01100_sapporo-shi_fld_pref_zfoobar_l2",
			Name:                "洪水浸水想定区域モデル zfoobar（都道府県管理区間）（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "洪水浸水想定区域モデル",
			TypeEn:              "fld",
			RootType:            true,
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_pref_zfoobar_l2/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"fld"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "想定最大規模",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_op_fld_pref_zfoobar_l2/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "fld"))
}

func TestTnm(t *testing.T) {
	i := CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionTnm: []string{
			"01100_sapporo-shi_2020_3dtiles_4_op_tnm_01_1.zip\n説明1",
		},
		OpenDataURL: "https://example.com",
		Tnm: []*cms.PublicAsset{
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_tnm_01_1.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_tnm_02_1.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_tnm_03_1.zip"),
		},
		Dic: `{"tnm":[
			{ "name":"01_1", "description":"津波1" },
			{ "name":"02_1", "description":"津波2" }
		]}`,
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_tnm_01_1",
			Name:                "津波浸水想定区域モデル 津波1（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "津波浸水想定区域モデル",
			TypeEn:              "tnm",
			RootType:            true,
			Description:         "説明1",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_tnm_01_1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"tnm"},
		},
		{
			ID:                  "01100_sapporo-shi_tnm_02_1",
			Name:                "津波浸水想定区域モデル 津波2（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "津波浸水想定区域モデル",
			TypeEn:              "tnm",
			RootType:            true,
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_tnm_02_1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"tnm"},
		},
		{
			ID:                  "01100_sapporo-shi_tnm_03_1",
			Name:                "津波浸水想定区域モデル 03_1（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "津波浸水想定区域モデル",
			TypeEn:              "tnm",
			RootType:            true,
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_tnm_03_1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"tnm"},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "tnm"))
}

func TestHtd(t *testing.T) {
	i := CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionHtd: []string{
			"01100_sapporo-shi_2020_3dtiles_4_op_htd_01_1.zip\n説明",
		},
		OpenDataURL: "https://example.com",
		Htd: []*cms.PublicAsset{
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_htd_01_1.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_htd_02_1.zip"),
		},
		Dic: `{"htd":[
			{ "name":"01_1", "description":"高潮1" }
		]}`,
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_htd_01_1",
			Name:                "高潮浸水想定区域モデル 高潮1（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "高潮浸水想定区域モデル",
			TypeEn:              "htd",
			RootType:            true,
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_htd_01_1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"htd"},
		},
		{
			ID:                  "01100_sapporo-shi_htd_02_1",
			Name:                "高潮浸水想定区域モデル 02_1（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "高潮浸水想定区域モデル",
			TypeEn:              "htd",
			RootType:            true,
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_htd_02_1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"htd"},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "htd"))
}

func TestIfld(t *testing.T) {
	i := CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionIfld: []string{
			"01100_sapporo-shi_2020_3dtiles_4_op_ifld_01_1.zip\n説明",
		},
		OpenDataURL: "https://example.com",
		Ifld: []*cms.PublicAsset{
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_ifld_01_1.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_ifld_02_1.zip"),
		},
		Dic: `{"ifld":[
			{ "name":"01_1", "description":"内水1" }
		]}`,
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:                  "01100_sapporo-shi_ifld_01_1",
			Name:                "内水浸水想定区域モデル 内水1（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "内水浸水想定区域モデル",
			TypeEn:              "ifld",
			RootType:            true,
			Description:         "説明",
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_ifld_01_1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"ifld"},
		},
		{
			ID:                  "01100_sapporo-shi_ifld_02_1",
			Name:                "内水浸水想定区域モデル 02_1（札幌市）",
			Pref:                "北海道",
			PrefCode:            "01",
			City:                "札幌市",
			CityEn:              "sapporo-shi",
			CityCode:            "01100",
			Type:                "内水浸水想定区域モデル",
			TypeEn:              "ifld",
			RootType:            true,
			URL:                 "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_ifld_02_1/tileset.json",
			OpenDataURL:         "https://example.com",
			Year:                2020,
			Format:              "3dtiles",
			Infobox:             true,
			Family:              "plateau",
			Edition:             "2022",
			CityGMLURL:          "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			CityGMLFeatureTypes: []string{"ifld"},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "ifld"))
}

func TestGen(t *testing.T) {
	i := CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionGen: []string{
			"01100_sapporo-shi_2020_mvt_4_op_gen_AAA_AAA.zip\n@name: 名称\n@root: true\n@order: 100\n説明1",
			"01100_sapporo-shi_2020_3dtiles_4_op_gen_BBB_BBB.zip\n説明2",
		},
		OpenDataURL: "https://example.com",
		Gen: []*cms.PublicAsset{
			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_4_op_gen_AAA_AAA.zip"),
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_gen_BBB_BBB.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:          "01100_sapporo-shi_gen_AAA_AAA",
			Name:        "名称（札幌市）",
			Pref:        "北海道",
			PrefCode:    "01",
			City:        "札幌市",
			CityEn:      "sapporo-shi",
			CityCode:    "01100",
			Type:        "汎用都市オブジェクトモデル",
			TypeEn:      "gen",
			RootType:    true,
			Description: "説明1",
			URL:         "https://example.com/01100_sapporo-shi_2020_mvt_4_op_gen_AAA_AAA/{z}/{x}/{y}.mvt",
			OpenDataURL: "https://example.com",
			Year:        2020,
			Format:      "mvt",
			Layers:      []string{"AAA_AAA"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name:   "名称",
						URL:    "https://example.com/01100_sapporo-shi_2020_mvt_4_op_gen_AAA_AAA/{z}/{x}/{y}.mvt",
						Type:   "mvt",
						Layers: []string{"AAA_AAA"},
					},
				},
			},
			Root:       true,
			Order:      lo.ToPtr(100),
			Infobox:    true,
			Family:     "plateau",
			Edition:    "2022",
			CityGMLURL: "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
		},
		{
			ID:          "01100_sapporo-shi_gen_BBB_BBB",
			Name:        "BBB_BBB（札幌市）",
			Pref:        "北海道",
			PrefCode:    "01",
			City:        "札幌市",
			CityEn:      "sapporo-shi",
			CityCode:    "01100",
			Type:        "汎用都市オブジェクトモデル",
			TypeEn:      "gen",
			RootType:    true,
			Description: "説明2",
			URL:         "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_gen_BBB_BBB/tileset.json",
			OpenDataURL: "https://example.com",
			Year:        2020,
			Format:      "3dtiles",
			Infobox:     true,
			Family:      "plateau",
			Edition:     "2022",
			CityGMLURL:  "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name: "BBB_BBB",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_gen_BBB_BBB/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "gen"))
}

func TestBrid(t *testing.T) {
	i := CMSItem{
		ID:              "id",
		Prefecture:      "北海道",
		CityName:        "札幌市",
		CityGML:         urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionBrid: "説明",
		OpenDataURL:     "https://example.com",
		Brid: []*cms.PublicAsset{

			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_4_op_brid_lod1.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_brid_lod3.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:          "01100_sapporo-shi_brid",
			Name:        "橋梁モデル（札幌市）",
			Pref:        "北海道",
			PrefCode:    "01",
			City:        "札幌市",
			CityEn:      "sapporo-shi",
			CityCode:    "01100",
			Type:        "橋梁モデル",
			TypeEn:      "brid",
			Description: "説明",
			URL:         "https://example.com/01100_sapporo-shi_2020_mvt_4_op_brid_lod1/{z}/{x}/{y}.mvt",
			OpenDataURL: "https://example.com",
			Year:        2020,
			Format:      "mvt",
			Layers:      []string{"brid"},
			Infobox:     true,
			Family:      "plateau",
			Edition:     "2022",
			CityGMLURL:  "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name:   "LOD1",
						URL:    "https://example.com/01100_sapporo-shi_2020_mvt_4_op_brid_lod1/{z}/{x}/{y}.mvt",
						Type:   "mvt",
						Layers: []string{"brid"},
					},
					{
						Name: "LOD3",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_brid_lod3/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "brid"))
}

func TestRail(t *testing.T) {
	i := CMSItem{
		ID:              "id",
		Prefecture:      "北海道",
		CityName:        "札幌市",
		CityGML:         urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionRail: "説明",
		OpenDataURL:     "https://example.com",
		Rail: []*cms.PublicAsset{

			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_4_op_rail.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_rail.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:          "01100_sapporo-shi_rail",
			Name:        "鉄道モデル（札幌市）",
			Pref:        "北海道",
			PrefCode:    "01",
			City:        "札幌市",
			CityEn:      "sapporo-shi",
			CityCode:    "01100",
			Type:        "鉄道モデル",
			TypeEn:      "rail",
			Description: "説明",
			URL:         "https://example.com/01100_sapporo-shi_2020_mvt_4_op_rail/{z}/{x}/{y}.mvt",
			OpenDataURL: "https://example.com",
			Year:        2020,
			Format:      "mvt",
			Layers:      []string{"rail"},
			Infobox:     true,
			Family:      "plateau",
			Edition:     "2022",
			CityGMLURL:  "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{
						Name:   "鉄道モデル1",
						URL:    "https://example.com/01100_sapporo-shi_2020_mvt_4_op_rail/{z}/{x}/{y}.mvt",
						Type:   "mvt",
						Layers: []string{"rail"},
					},
					{
						Name: "鉄道モデル2",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_rail/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "rail"))
}

func TestExtra(t *testing.T) {
	i := CMSItem{
		ID:         "id",
		Prefecture: "北海道",
		CityName:   "札幌市",
		CityGML:    urlToA("https://example.com/01100_sapporo-shi_2020_citygml_op.zip"),
		DescriptionExtra: []string{
			`01100_sapporo-shi_2020_3dtiles_4_op_ex-port-hogehoge-bldg_lod1.zip
@name: 名称
@type: タイプ
@type_en: type
@area: 地域
説明1`,
			`01100_sapporo-shi_2020_mvt_4_op_ex-port-hogehoge-hoge_lod2.zip
@layer: layer2
説明2`,
			`01100_sapporo-shi_2020_mvt_4_op_ex-port-hogehoge-hoge_lod1.zip
@layer: layer1
説明3`,
			`01100_sapporo-shi_2020_mvt_4_op_ex-port-hogehoge-hoge_lod2_no_texture.zip
@layer: layer1, layer2
@dataset_order: -1
説明4`,
			`01100_sapporo-shi_2020_3dtiles_4_op_ex-port-hogehoge-hoge_no_texture.zip
説明5`,
		},
		OpenDataURL: "https://example.com",
		Extra: []*cms.PublicAsset{
			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_ex-port-hogehoge-bldg_lod1.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_4_op_ex-port-hogehoge-hoge_lod2.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_4_op_ex-port-hogehoge-hoge_lod1.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_mvt_4_op_ex-port-hogehoge-hoge_lod2_no_texture.zip"),

			urlToA("https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_ex-port-hogehoge-hoge_no_texture.zip"),
		},
	}

	assert.Equal(t, []*DataCatalogItem{
		{
			ID:          "01100_sapporo-shi_ex_port-hogehoge-bldg",
			Name:        "名称（地域）",
			Pref:        "北海道",
			PrefCode:    "01",
			City:        "札幌市",
			CityEn:      "sapporo-shi",
			CityCode:    "01100",
			Type:        "タイプ",
			TypeEn:      "type",
			Description: "説明1",
			URL:         "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_ex-port-hogehoge-bldg_lod1/tileset.json",
			OpenDataURL: "https://example.com",
			Year:        2020,
			Format:      "3dtiles",
			Infobox:     true,
			Family:      "plateau",
			Edition:     "2022",
			CityGMLURL:  "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{ // asset 1
						Name: "LOD1",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_ex-port-hogehoge-bldg_lod1/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
		{
			ID:          "01100_sapporo-shi_ex_port-hogehoge-hoge",
			Name:        "その他のデータセット（札幌市）",
			Pref:        "北海道",
			PrefCode:    "01",
			City:        "札幌市",
			CityEn:      "sapporo-shi",
			CityCode:    "01100",
			Type:        "その他のデータセット",
			TypeEn:      "ex",
			OpenDataURL: "https://example.com",
			Year:        2020,
			Description: "説明4",
			URL:         "https://example.com/01100_sapporo-shi_2020_mvt_4_op_ex-port-hogehoge-hoge_lod2_no_texture/{z}/{x}/{y}.mvt",
			Format:      "mvt",
			Layers:      []string{"layer1", "layer2"},
			Infobox:     true,
			Family:      "plateau",
			Edition:     "2022",
			CityGMLURL:  "https://example.com/01100_sapporo-shi_2020_citygml_op.zip",
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: []datacatalogutil.DataCatalogItemConfigItem{
					{ // asset 4
						Name:   "LOD2（テクスチャなし）",
						URL:    "https://example.com/01100_sapporo-shi_2020_mvt_4_op_ex-port-hogehoge-hoge_lod2_no_texture/{z}/{x}/{y}.mvt",
						Type:   "mvt",
						Layers: []string{"layer1", "layer2"},
					},
					{ // asset 2
						Name:   "LOD2",
						URL:    "https://example.com/01100_sapporo-shi_2020_mvt_4_op_ex-port-hogehoge-hoge_lod2/{z}/{x}/{y}.mvt",
						Type:   "mvt",
						Layers: []string{"layer2"},
					},
					{ // asset 3
						Name:   "LOD1",
						URL:    "https://example.com/01100_sapporo-shi_2020_mvt_4_op_ex-port-hogehoge-hoge_lod1/{z}/{x}/{y}.mvt",
						Type:   "mvt",
						Layers: []string{"layer1"},
					},
					{ // asset 5
						Name: "その他のデータセット4（テクスチャなし）",
						URL:  "https://example.com/01100_sapporo-shi_2020_3dtiles_4_op_ex-port-hogehoge-hoge_no_texture/tileset.json",
						Type: "3dtiles",
					},
				},
			},
		},
	}, i.DataCatalogItems(i.IntermediateItem(), "extra"))
}

func urlToA(url string) *cms.PublicAsset {
	return &cms.PublicAsset{Asset: cms.Asset{URL: url}}
}
