package sidebar

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/jarcoal/httpmock"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestShareEcho(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	mockShareCMS(t)

	e := echo.New()
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		if errors.Is(err, rerror.ErrNotFound) {
			_ = c.JSON(http.StatusNotFound, err.Error())
			return
		}
		_ = c.JSON(http.StatusInternalServerError, err.Error())
	}

	g := e.Group("/share")
	assert.NoError(t, ShareEcho(g, Config{
		Config: plateaucms.Config{
			CMSBaseURL:     "https://cms.example.com",
			CMSMainToken:   "token",
			CMSMainProject: "prj",
		},
	}))

	r := httptest.NewRequest("GET", "/share/prj/aaaa", nil)
	w := httptest.NewRecorder()
	e.ServeHTTP(w, r)
	assert.Equal(t, http.StatusNotFound, w.Result().StatusCode)
	assert.Equal(t, `"not found"`, strings.TrimSpace(w.Body.String()))

	r = httptest.NewRequest("GET", "/share/prj/aaa", nil)
	w = httptest.NewRecorder()
	e.ServeHTTP(w, r)
	assert.Equal(t, http.StatusOK, w.Result().StatusCode)
	assert.Equal(t, `{"a":"b"}`, strings.TrimSpace(w.Body.String()))

	r = httptest.NewRequest("POST", "/share/prj", strings.NewReader(`{"a":"b"}`))
	w = httptest.NewRecorder()
	e.ServeHTTP(w, r)
	assert.Equal(t, http.StatusOK, w.Result().StatusCode)
	assert.Equal(t, `"aaa"`, strings.TrimSpace(w.Body.String()))

	r = httptest.NewRequest("POST", "/share/prj", strings.NewReader(`---`))
	w = httptest.NewRecorder()
	e.ServeHTTP(w, r)
	assert.Equal(t, http.StatusBadRequest, w.Result().StatusCode)
	assert.Equal(t, `"invalid json"`, strings.TrimSpace(w.Body.String()))
}

func mockShareCMS(t *testing.T) {
	t.Helper()

	httpmock.RegisterResponder("GET", "https://cms.example.com/api/items/aaa", func(r *http.Request) (*http.Response, error) {
		if r.Header.Get("Authorization") != "Bearer token" {
			return httpmock.NewBytesResponse(http.StatusUnauthorized, nil), nil
		}
		return httpmock.NewJsonResponse(http.StatusOK, map[string]any{"id": "aaa", "fields": []map[string]string{{"key": "data", "value": `{"a":"b"}`}}})
	})

	httpmock.RegisterResponder("GET", "https://cms.example.com/api/items/aaaa", lo.Must(httpmock.NewJsonResponder(http.StatusNotFound, "not found")))

	httpmock.RegisterResponder("POST", "https://cms.example.com/api/projects/prj/models/share/items", func(r *http.Request) (*http.Response, error) {
		if r.Header.Get("Authorization") != "Bearer token" {
			return httpmock.NewBytesResponse(http.StatusUnauthorized, nil), nil
		}
		return httpmock.NewJsonResponse(http.StatusOK, map[string]string{"id": "aaa"})
	})
}
