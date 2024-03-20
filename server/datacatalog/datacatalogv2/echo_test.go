package datacatalogv2

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/jarcoal/httpmock"
	"github.com/labstack/echo/v4"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestEcho(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	conf := mock(t)

	e := echo.New()
	g := e.Group("/datacatalog")
	assert.NoError(t, Echo(Config{
		Config:       conf,
		DisableCache: true,
	}, g))

	// no merge
	req := httptest.NewRequest(http.MethodGet, "/datacatalog/subprj", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.JSONEq(t, `[
		{
			"city": "xxx市",
			"city_code": "00000",
			"city_en": "xxx-shi",
			"config": {
				"data": [
					{
						"name": "建築物モデル",
						"type": "3dtiles",
						"url": "https://example.com/00000_xxx-shi_2022_3dtiles_1_op_bldg/tileset.json"
					}
				]
			},
			"format": "3dtiles",
			"id": "00000_xxx-shi_bldg",
			"itemId": "a",
			"name": "建築物モデル（xxx市）",
			"openDataUrl": "https://www.geospatial.jp/ckan/dataset/plateau-00000-xxx-shi-2022",
			"type": "建築物モデル",
			"type_en": "bldg",
			"url": "https://example.com/00000_xxx-shi_2022_3dtiles_1_op_bldg/tileset.json",
			"year": 2022,
			"infobox": true
		},
		{
			"city": "yyy市",
			"city_code": "11111",
			"city_en": "yyy-shi",
			"config": {
				"data": [
					{
						"name": "建築物モデル",
						"type": "3dtiles",
						"url": "https://example.com/11111_yyy-shi_2022_3dtiles_1_op_bldg/tileset.json"
					}
				]
			},
			"format": "3dtiles",
			"id": "11111_yyy-shi_bldg",
			"itemId": "b",
			"name": "建築物モデル（yyy市）",
			"openDataUrl": "https://www.geospatial.jp/ckan/dataset/plateau-11111-yyy-shi-2022",
			"type": "建築物モデル",
			"type_en": "bldg",
			"url": "https://example.com/11111_yyy-shi_2022_3dtiles_1_op_bldg/tileset.json",
			"year": 2022,
			"infobox": true
		},
		{
			"id": "c",
			"city": "xxx市"
		}
	]`, rec.Body.String())
}

func TestEchoMerge(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	conf := mock(t)

	e := echo.New()
	g := e.Group("/datacatalog")
	assert.NoError(t, Echo(Config{
		Config:       conf,
		DisableCache: true,
	}, g))

	// merge
	req := httptest.NewRequest(http.MethodGet, "/datacatalog/ppp", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.JSONEq(t, `[
		{
			"city": "xxx市",
			"city_code": "00000",
			"city_en": "xxx-shi",
			"config": {
				"data": [
					{
						"name": "建築物モデル",
						"type": "3dtiles",
						"url": "https://example.com/00000_xxx-shi_2022_3dtiles_1_op_bldg/tileset.json"
					}
				]
			},
			"format": "3dtiles",
			"id": "00000_xxx-shi_bldg",
			"itemId": "a",
			"name": "建築物モデル（xxx市）",
			"openDataUrl": "https://www.geospatial.jp/ckan/dataset/plateau-00000-xxx-shi-2022",
			"type": "建築物モデル",
			"type_en": "bldg",
			"url": "https://example.com/00000_xxx-shi_2022_3dtiles_1_op_bldg/tileset.json",
			"year": 2022,
			"infobox": true
		},
		{
			"id": "z"
		},
		{
			"id": "c",
			"city": "xxx市"
		},
		{
			"id": "y",
			"type": "ユースケース",
			"type_en": "usecase",
			"root_type": true
		}
	]`, rec.Body.String())
}

func mock(t *testing.T) plateaucms.Config {
	t.Helper()

	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath("https://example.com", "api", "projects", "system", "models", "workspaces", "items")),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, cms.Items{
			PerPage:    1,
			Page:       1,
			TotalCount: 1,
			Items: []cms.Item{
				{
					ID: "1",
					Fields: []*cms.Field{
						{Key: "project_alias", Value: "ppp"},
						{Key: "subproject_alias", Value: "subprj"},
						{Key: "name", Value: "xxx市"},
						{Key: "cms_apikey", Value: "apikey"},
					},
				},
				{
					ID: "2",
					Fields: []*cms.Field{
						{Key: "project_alias", Value: "subprj"},
						{Key: "cms_apikey", Value: "apikey"},
					},
				},
			},
		}),
	)

	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/plateau", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{},
		"totalCount": 0,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/usecase", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]any{"id": "y"}},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/dataset", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]any{"id": "z"}},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/subprj/plateau", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results": []any{
			map[string]any{
				"id":        "a",
				"city_name": "xxx市",
				"citygml": map[string]any{
					"type": "asset",
					"id":   "xxx",
					"url":  "https://example.com/00000_xxx-shi_2022_citygml_1_op.zip",
				},
				"bldg": []map[string]any{
					{
						"type": "asset",
						"id":   "xxx",
						"url":  "https://example.com/00000_xxx-shi_2022_3dtiles_1_op_bldg.zip",
					},
				},
				"year": 2022,
			},
			map[string]any{
				"id":        "b",
				"city_name": "yyy市",
				"citygml": map[string]any{
					"type": "asset",
					"id":   "xxx",
					"url":  "https://example.com/11111_yyy-shi_2022_citygml_1_op.zip",
				},
				"bldg": []map[string]any{
					{
						"type": "asset",
						"id":   "xxx",
						"url":  "https://example.com/11111_yyy-shi_2022_3dtiles_1_op_bldg.zip",
					},
				},
				"year": 2022,
			},
		},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/subprj/dataset", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]string{"id": "c", "city_name": "xxx市"}},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/subprj/usecase", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusNotFound, "not found")))

	return plateaucms.Config{
		CMSBaseURL:      "https://example.com",
		CMSMainToken:    "",
		CMSTokenProject: "system",
	}
}
