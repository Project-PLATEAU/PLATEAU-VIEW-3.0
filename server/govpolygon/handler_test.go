package govpolygon

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestHandler(t *testing.T) {
	url := ""
	if url == "" {
		t.Skip("skipping test; no URL provided")
	}
	h := New(url, true)

	e := echo.New()
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	c := e.NewContext(r, w)

	assert.NoError(t, h.GetGeoJSON(c))

	assert.Equal(t, http.StatusOK, w.Code)
	body := w.Body.String()
	assert.NotEmpty(t, body)

	t.Log(body)
}
