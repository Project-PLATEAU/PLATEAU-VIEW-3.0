package sidebar

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"path"
	"strings"
	"testing"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/jarcoal/httpmock"
	"github.com/labstack/echo/v4"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

const (
	testCMSHost            = "https://example.com"
	testCMSToken           = "token"
	testCMSProject         = "prj"
	testSidebarAccessToken = "access_token"
)

func TestHandler(t *testing.T) {
	const base = ""
	const token = ""
	const project = ""

	if base == "" || token == "" || project == "" {
		t.SkipNow()
	}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues(project)

	h := lo.Must(NewHandler(Config{
		Config: plateaucms.Config{
			CMSBaseURL:      base,
			CMSMainToken:    token,
			CMSTokenProject: tokenProject,
		},
	}))
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.fetchRoot())
	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, "", rec.Body.String())

	// _ = os.WriteFile("result.json", rec.Body.Bytes(), 0644)
}

func TestHandler_getDataHandler(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)

	expected := `{"hoge":"hoge"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		if req.Header.Get("Authorization") != "Bearer "+testCMSToken {
			return httpmock.NewJsonResponse(http.StatusUnauthorized, nil)
		}

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: itemID,
			Fields: []*cms.Field{
				{Key: dataField, Value: expected},
			},
		})
	}
	httpmock.RegisterResponder("GET", lo.Must(url.JoinPath(testCMSHost, "api", "items", itemID)), responder)
	h := newHandler()
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.getDataHandler())

	p := path.Join("/", testCMSProject, "data", itemID)
	req := httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues(testCMSProject, itemID)

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())

	// invalid
	p = path.Join("/", "INVALID", "data", itemID)
	req = httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	ctx = echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues("INVALID", itemID)
	assert.Equal(t, rerror.ErrNotFound, handler(ctx))
}

func TestHandler_getDataHandler2(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)

	expected := `{"hoge":"hoge"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		if req.Header.Get("Authorization") != "Bearer token!" {
			return httpmock.NewJsonResponse(http.StatusUnauthorized, nil)
		}

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: itemID,
			Fields: []*cms.Field{
				{Key: dataField, Value: expected},
			},
		})
	}
	httpmock.RegisterResponder("GET", lo.Must(url.JoinPath(testCMSHost, "api", "items", itemID)), responder)
	h := newHandler()
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.getDataHandler())

	p := path.Join("/", "prjprj", "data", itemID)
	req := httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues("prjprj", itemID)

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())

	// not found
	p = path.Join("/", "INVALID", "data", itemID)
	req = httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	ctx = echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues("INVALID", itemID)
	assert.Equal(t, rerror.ErrNotFound, handler(ctx))
}

func TestHandler_getAllDataHandler(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)

	expected := `[{"hoge":"foo"},{"hoge":"bar"}]` + "\n"
	lastModified := time.Date(2022, time.April, 1, 0, 0, 0, 0, time.Local)
	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", dataModelKey)),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, &cms.Model{LastModified: lastModified}),
	)
	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", dataModelKey, "items")),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, &cms.Items{
			Items: []cms.Item{
				{
					ID:     "a",
					Fields: []*cms.Field{{Key: dataField, Value: `{"hoge":"foo"}`}},
				},
				{
					ID:     "b",
					Fields: []*cms.Field{{Key: dataField, Value: `{"hoge":"bar"}`}},
				},
			},
			Page:       1,
			PerPage:    50,
			TotalCount: 1,
		}),
	)

	h := newHandler()
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.getAllDataHandler())

	req := httptest.NewRequest(http.MethodGet, path.Join("/", testCMSProject, "data"), nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues(testCMSProject)

	res := handler(ctx)
	assert.NoError(t, res)
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
	assert.Equal(t, lastModified.Format(time.RFC1123), rec.Header().Get("Last-Modified"))
}

func TestHandler_createDataHandler(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)

	expected := `{"hoge":"foo"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		i := cms.Item{}
		_ = json.Unmarshal(lo.Must(io.ReadAll(req.Body)), &i)

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: "a",
			Fields: []*cms.Field{
				{Key: dataField, Value: i.FieldByKey(dataField).GetValue().String()},
			},
		},
		)
	}
	httpmock.RegisterResponder("POST", lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", dataModelKey, "items")), responder)

	h := newHandler()
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.createDataHandler())

	req := httptest.NewRequest(http.MethodPost, path.Join("/", testCMSProject, "data"), strings.NewReader(`{"hoge":"foo"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testSidebarAccessToken)
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues(testCMSProject)

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())

	// invalid token
	req = httptest.NewRequest(http.MethodPost, path.Join("/", testCMSProject, "data"), strings.NewReader(`{"hoge":"foo"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer INVALID")
	rec = httptest.NewRecorder()

	ctx = echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues(testCMSProject)

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusUnauthorized, rec.Result().StatusCode)
}

func TestHandler_updateDataHandler(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)

	expected := `{"hoge":"hoge"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		i := cms.Item{}
		_ = json.Unmarshal(lo.Must(io.ReadAll(req.Body)), &i)

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: itemID,
			Fields: []*cms.Field{
				{Key: dataField, Value: i.FieldByKey(dataField).GetValue().String()},
			},
		},
		)
	}
	httpmock.RegisterResponder("PATCH", lo.Must(url.JoinPath(testCMSHost, "api", "items", itemID)), responder)

	p := path.Join("/", testCMSProject, "data/", itemID)
	req := httptest.NewRequest(http.MethodGet, p, strings.NewReader(`{"hoge":"hoge"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testSidebarAccessToken)
	rec := httptest.NewRecorder()

	h := newHandler()
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.updateDataHandler())

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues(testCMSProject, itemID)

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
}

func TestHandler_deleteDataHandler(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)

	httpmock.RegisterResponder("DELETE", lo.Must(url.JoinPath(testCMSHost, "/api/items/", itemID)), httpmock.NewBytesResponder(http.StatusNoContent, nil))

	p := path.Join("/", testCMSProject, "data/", itemID)
	req := httptest.NewRequest(http.MethodGet, p, nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testSidebarAccessToken)
	rec := httptest.NewRecorder()

	h := newHandler()
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.deleteDataHandler())

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "iid")
	ctx.SetParamValues(testCMSProject, itemID)

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusNoContent, rec.Result().StatusCode)
}

func TestHandler_fetchTemplatesHandler(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)

	expected := `[{"hoge":"hoge"},{"hoge":"foo"}]` + "\n"
	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", templateModelKey, "items")),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, &cms.Items{
			Items: []cms.Item{
				{
					ID:     "a",
					Fields: []*cms.Field{{Key: dataField, Value: `{"hoge":"hoge"}`}},
				},
				{
					ID:     "b",
					Fields: []*cms.Field{{Key: dataField, Value: `{"hoge":"foo"}`}},
				},
			},
			Page:       1,
			PerPage:    50,
			TotalCount: 2,
		}),
	)
	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", templateModelKey)),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, &cms.Model{}),
	)

	h := newHandler()
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.fetchTemplatesHandler())

	req := httptest.NewRequest(http.MethodGet, path.Join("/", testCMSProject, "templates"), nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues(testCMSProject)

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
}

func TestHandler_fetchTemplateHandler(t *testing.T) {
	templateID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)

	expected := `{"hoge":"hoge"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID:     templateID,
			Fields: []*cms.Field{{Key: dataField, Value: `{"hoge":"hoge"}`}},
		})
	}
	httpmock.RegisterResponder("GET", lo.Must(url.JoinPath(testCMSHost, "api", "items", templateID)), responder)

	req := httptest.NewRequest(http.MethodGet, path.Join("/", testCMSProject, "templates", templateID), nil)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	h := newHandler()
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.fetchTemplateHandler())

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "tid")
	ctx.SetParamValues(testCMSProject, templateID)

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
}

func TestHandler_createTemplateHandler(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)

	expected := `{"hoge":"hoge"}` + "\n"
	responder := func(req *http.Request) (*http.Response, error) {
		i := cms.Item{}
		_ = json.Unmarshal(lo.Must(io.ReadAll(req.Body)), &i)

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: "a",
			Fields: []*cms.Field{
				{Key: dataField, Value: i.FieldByKey(dataField).GetValue().String()},
			},
		},
		)
	}
	httpmock.RegisterResponder("POST", lo.Must(url.JoinPath(testCMSHost, "api", "projects", testCMSProject, "models", templateModelKey, "items")), responder)

	h := newHandler()
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.createTemplateHandler())

	req := httptest.NewRequest(http.MethodGet, path.Join("/", testCMSProject, "templates"), strings.NewReader(`{"hoge":"hoge"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testSidebarAccessToken)
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid")
	ctx.SetParamValues(testCMSProject)

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, expected, rec.Body.String())
}

func TestHandler_updateTemplateHandler(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)

	responder := func(req *http.Request) (*http.Response, error) {
		i := cms.Item{}
		_ = json.Unmarshal(lo.Must(io.ReadAll(req.Body)), &i)

		return httpmock.NewJsonResponse(http.StatusOK, cms.Item{
			ID: itemID,
			Fields: []*cms.Field{
				{Key: dataField, Value: i.FieldByKey(dataField).GetValue().String()},
			},
		},
		)
	}
	httpmock.RegisterResponder("PATCH", lo.Must(url.JoinPath(testCMSHost, "api", "items", itemID)), responder)

	h := newHandler()
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.updateTemplateHandler())

	p := path.Join("/", testCMSProject, "templates", itemID)
	req := httptest.NewRequest(http.MethodGet, p, strings.NewReader(`{"hoge":"hoge"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testSidebarAccessToken)
	rec := httptest.NewRecorder()
	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "tid")
	ctx.SetParamValues(testCMSProject, itemID)

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusOK, rec.Result().StatusCode)
	assert.Equal(t, `{"hoge":"hoge"}`+"\n", rec.Body.String())
}

func TestHandler_deleteTemplateHandler(t *testing.T) {
	itemID := "aaa"
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockCMS(t)

	httpmock.RegisterResponder("DELETE", lo.Must(url.JoinPath(testCMSHost, "api", "items", itemID)), httpmock.NewBytesResponder(http.StatusNoContent, nil))

	h := newHandler()
	handler := h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
		Key:         "pid",
		AuthMethods: authMethods,
	})(h.deleteTemplateHandler())

	req := httptest.NewRequest(http.MethodGet, path.Join("/", testCMSProject, "templates", itemID), nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+testSidebarAccessToken)
	rec := httptest.NewRecorder()

	ctx := echo.New().NewContext(req, rec)
	ctx.SetParamNames("pid", "tid")
	ctx.SetParamValues(testCMSProject, itemID)

	assert.NoError(t, handler(ctx))
	assert.Equal(t, http.StatusNoContent, rec.Result().StatusCode)
}

func newHandler() *Handler {
	return lo.Must(NewHandler(Config{
		Config: plateaucms.Config{
			CMSBaseURL:      testCMSHost,
			CMSMainToken:    testCMSToken,
			CMSTokenProject: tokenProject,
		},
	}))
}

func mockCMS(t *testing.T) {
	t.Helper()

	httpmock.RegisterResponder(
		"GET",
		lo.Must(url.JoinPath(testCMSHost, "api", "projects", tokenProject, "models", tokenModel, "items")),
		httpmock.NewJsonResponderOrPanic(http.StatusOK, cms.Items{
			PerPage:    1,
			Page:       1,
			TotalCount: 1,
			Items: []cms.Item{
				{
					ID: "1",
					Fields: []*cms.Field{
						{Key: tokenProjectField, Value: testCMSProject},
						{Key: "cms_apikey", Value: testCMSToken},
						{Key: "sidebar_access_token", Value: testSidebarAccessToken},
					},
				},
				{
					ID: "2",
					Fields: []*cms.Field{
						{Key: tokenProjectField, Value: "prjprj"},
						{Key: "cms_apikey", Value: "token!"},
						{Key: "sidebar_access_token", Value: "ac"},
					},
				},
			},
		}),
	)
}
