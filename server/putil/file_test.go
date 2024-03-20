package putil

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestDeliverFile(t *testing.T) {
	tmpdir := os.TempDir()
	tmppath := filepath.Join(tmpdir, "test.txt")
	tmppath2 := filepath.Join(tmpdir, "test2.txt")
	_ = os.WriteFile(tmppath, []byte("test"), 0644)
	defer os.Remove(tmppath)

	e := echo.New()

	assert.True(t, DeliverFile(e.Group(""), tmppath, "text/plain"))
	assert.False(t, DeliverFile(e.Group(""), tmppath2, "text/plain"))

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test.txt", nil)
	e.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "test", rec.Body.String())

	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/test2.txt", nil)
	e.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusNotFound, rec.Code)
}
