package sdkapiv2

import (
	"net/url"
	"testing"
	"time"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestItems_DatasetResponse(t *testing.T) {
	assert.Equal(t, &DatasetResponse{
		Data: []*DatasetPref{
			{
				ID:    "東京都",
				Title: "東京都",
				Data: []DatasetCity{
					{
						ID:           "id",
						Title:        "千代田区",
						Description:  "description",
						CityCode:     10000,
						Year:         2022,
						FeatureTypes: []string{"bldg", "tran", "frn", "veg", "dem"},
					},
				},
			},
		},
	}, Items{
		{
			ID:          "id",
			Prefecture:  "東京都",
			CityName:    "千代田区",
			Description: "description",
			CityGML: &cms.PublicAsset{
				Asset: cms.Asset{
					ID:                      "citygml",
					ArchiveExtractionStatus: "done",
					URL:                     "/10000_hoge-shi_2022_citygml_op.zip",
				},
			},
			Bldg: []cms.PublicAsset{{}},
			Tran: []cms.PublicAsset{{}},
			Frn:  []cms.PublicAsset{{}},
			Veg:  []cms.PublicAsset{{}},
			MaxLOD: &cms.PublicAsset{
				Asset: cms.Asset{
					URL: "https://example.com/csv",
				},
			},
			Dem:            "有り",
			SDKPublication: "公開する",
		},
	}.DatasetResponse())
}

func TestMaxLODColumns_Map(t *testing.T) {
	assert.Equal(t, MaxLODMap{
		"bldg": map[string]MaxLODMapItem{
			"1": {MaxLOD: 1, Files: []string{""}},
			"2": {MaxLOD: 1, Files: []string{"2_bldg_xxx_op.gml"}},
		},
		"veg": map[string]MaxLODMapItem{
			"1": {MaxLOD: 2, Files: []string{""}},
		},
		"frn": map[string]MaxLODMapItem{
			"2": {MaxLOD: 2, Files: []string{""}},
		},
		"dem": map[string]MaxLODMapItem{
			"3": {MaxLOD: 1, Files: []string{
				"533914_dem_6697_00_op.gml",
				"533914_dem_6697_05_op.gml",
				"533914_dem_6697_50_op.gml",
				"533914_dem_6697_55_op.gml",
			}},
		},
	}, MaxLODColumns{
		{Code: "1", Type: "bldg", MaxLOD: 1},
		{Code: "2", Type: "bldg", MaxLOD: 1, File: "2_bldg_xxx_op.gml"},
		{Code: "1", Type: "veg", MaxLOD: 2},
		{Code: "2", Type: "frn", MaxLOD: 2},
		{Code: "3", Type: "dem", MaxLOD: 1, File: "533914_dem_6697_00_op.gml"},
		{Code: "3", Type: "dem", MaxLOD: 1, File: "533914_dem_6697_05_op.gml"},
		{Code: "3", Type: "dem", MaxLOD: 1, File: "533914_dem_6697_50_op.gml"},
		{Code: "3", Type: "dem", MaxLOD: 1, File: "533914_dem_6697_55_op.gml"},
	}.Map())
}

func TestMaxLODMap_Files(t *testing.T) {
	res, warning := MaxLODMap{
		"bldg": map[string]MaxLODMapItem{
			"2": {MaxLOD: 1, Files: []string{""}},
			"1": {MaxLOD: 1, Files: []string{""}},
		},
		"veg": map[string]MaxLODMapItem{
			"1": {MaxLOD: 2, Files: []string{""}},
		},
		"frn": map[string]MaxLODMapItem{
			"2": {MaxLOD: 2, Files: []string{""}},
		},
		"fld": map[string]MaxLODMapItem{
			"3": {MaxLOD: 1, Files: []string{"aaa.gml"}},
		},
		"dem": map[string]MaxLODMapItem{
			"1111": {MaxLOD: 1, Files: []string{
				"00000_dem_1111_00_op.gml",
				"00000_dem_1111_05_op.gml",
				"00000_dem_1111_50_op.gml",
				"00000_dem_1111_55_op.gml",
			}},
		},
	}.Files([]*url.URL{
		lo.Must(url.Parse("https://example.com/1_bldg_xxx.gml")),
		lo.Must(url.Parse("https://example.com/2_bldg_yyy.gml")),
		lo.Must(url.Parse("https://example.com/1_veg_zzz.gml")),
		lo.Must(url.Parse("https://example.com/aaa.gml")),
		lo.Must(url.Parse("https://example.com/00000_dem_1111_00_op.gml")),
		lo.Must(url.Parse("https://example.com/00000_dem_1111_05_op.gml")),
		lo.Must(url.Parse("https://example.com/00000_dem_1111_50_op.gml")),
		lo.Must(url.Parse("https://example.com/00000_dem_1111_55_op.gml")),
	})

	assert.Equal(t, warning, []string{"unmatched:type=frn,code=2,path="})
	assert.Equal(t, FilesResponse{
		"bldg": []File{
			{Code: "1", URL: "https://example.com/1_bldg_xxx.gml", MaxLOD: 1},
			{Code: "2", URL: "https://example.com/2_bldg_yyy.gml", MaxLOD: 1},
		},
		"veg": []File{
			{Code: "1", URL: "https://example.com/1_veg_zzz.gml", MaxLOD: 2},
		},
		"frn": nil,
		"fld": []File{
			{Code: "3", URL: "https://example.com/aaa.gml", MaxLOD: 1},
		},
		"dem": []File{
			{Code: "1111", URL: "https://example.com/00000_dem_1111_00_op.gml", MaxLOD: 1},
			{Code: "1111", URL: "https://example.com/00000_dem_1111_05_op.gml", MaxLOD: 1},
			{Code: "1111", URL: "https://example.com/00000_dem_1111_50_op.gml", MaxLOD: 1},
			{Code: "1111", URL: "https://example.com/00000_dem_1111_55_op.gml", MaxLOD: 1},
		},
	}, res)
}

func TestItemsFromIntegration(t *testing.T) {
	ti, _ := time.Parse(time.RFC3339, "2023-03-01T00:00:00.00Z")

	cmsitems := []cms.Item{
		{
			ID: "xxx",
			Fields: []*cms.Field{
				{
					Key:   "specification",
					Value: "第2.3版",
				},
				{
					Key:   "prefecture",
					Value: "pref",
				},
				{
					Key:   "city_name",
					Value: "city",
				},
				{
					Key: "citygml",
					Value: map[string]any{
						"archiveExtractionStatus": "done",
						"contentType":             "application/octet-stream",
						"createdAt":               "2023-03-01T00:00:00.00Z",
						"file": map[string]any{
							"contentType": "application/octet-stream",
							"name":        "c.zip",
							"path":        "/c.zip",
							"size":        1000,
						},
						"id":          "assetc",
						"name":        "c.zip",
						"previewType": "geo",
						"projectId":   "prj",
						"totalSize":   1000,
						"url":         "https://example.com/c.zip",
					},
				},
				{
					Key:   "description_bldg",
					Value: "desc",
				},
				{
					Key: "bldg",
					Value: []any{
						map[string]any{
							"archiveExtractionStatus": "done",
							"contentType":             "application/octet-stream",
							"createdAt":               "2023-03-01T00:00:00.00Z",
							"file": map[string]any{
								"contentType": "application/octet-stream",
								"name":        "b.zip",
								"path":        "/b.zip",
								"size":        1000,
							},
							"id":          "asset",
							"name":        "b.zip",
							"previewType": "geo",
							"projectId":   "prj",
							"totalSize":   1000,
							"url":         "https://example.com/b.zip",
						},
					},
				},
				{
					Key:   "max_lod",
					Value: nil,
				},
				{
					Key:   "sdk_publication",
					Value: "公開する",
				},
				{
					Key:   "dem",
					Value: "有り",
				},
			},
		},
	}

	items := ItemsFromIntegration(cmsitems)
	assert.Equal(t, Items{
		{
			ID:            "xxx",
			Specification: "第2.3版",
			Prefecture:    "pref",
			CityName:      "city",
			Description:   "desc",
			CityGML: &cms.PublicAsset{
				Type: "asset",
				Asset: cms.Asset{
					ID:                      "assetc",
					URL:                     "https://example.com/c.zip",
					ContentType:             "application/octet-stream",
					ArchiveExtractionStatus: "done",
					Name:                    "c.zip",
					PreviewType:             "geo",
					ProjectID:               "prj",
					TotalSize:               1000,
					CreatedAt:               ti,
					File: &cms.File{
						Name:        "c.zip",
						Size:        1000,
						ContentType: "application/octet-stream",
						Path:        "/c.zip",
					},
				},
			},
			MaxLOD: nil,
			Bldg: []cms.PublicAsset{
				{
					Type: "asset",
					Asset: cms.Asset{
						ID:                      "asset",
						URL:                     "https://example.com/b.zip",
						ContentType:             "application/octet-stream",
						ArchiveExtractionStatus: "done",
						Name:                    "b.zip",
						PreviewType:             "geo",
						ProjectID:               "prj",
						TotalSize:               1000,
						CreatedAt:               ti,
						File: &cms.File{
							Name:        "b.zip",
							Size:        1000,
							ContentType: "application/octet-stream",
							Path:        "/b.zip",
						},
					},
				},
			},
			Dem:            "有り",
			SDKPublication: "公開する",
		},
	}, items)
}

func TestCityCode(t *testing.T) {
	assert.Equal(t, 123, cityCode(&cms.PublicAsset{
		Asset: cms.Asset{
			URL: "https://example.com/aaa/123_aaa.zip",
		},
	}))
	assert.Equal(t, 0, cityCode(&cms.PublicAsset{
		Asset: cms.Asset{
			URL: "https://example.com/aaa/aaa_aaa.zip",
		},
	}))
	assert.Equal(t, 0, cityCode(&cms.PublicAsset{}))
	assert.Equal(t, 0, cityCode(nil))
}

func TestItem_Year(t *testing.T) {
	assert.Equal(t, 2022, Item{
		CityGML: &cms.PublicAsset{
			Asset: cms.Asset{
				URL: "https://example.com/10000_hoge-shi_2022_citygml_op",
			},
		},
	}.Year())
}
