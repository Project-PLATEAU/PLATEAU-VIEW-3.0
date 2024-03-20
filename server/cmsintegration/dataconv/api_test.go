package dataconv

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/stretchr/testify/assert"
)

func TestHandler(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	httpmock.RegisterResponder("GET", borderURL, httpmock.NewStringResponder(http.StatusOK, border))

	s := &Service{
		cms:  &cmsMock{},
		conf: Config{CMSModel: defaultCMSModel},
	}
	h, err := handler(s, "token")
	assert.NoError(t, err)

	w := httptest.NewRecorder()
	r := httptest.NewRequest("POST", "/", strings.NewReader("{}"))
	h.ServeHTTP(w, r)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "Unauthorized\n", w.Body.String())

	w = httptest.NewRecorder()
	r = httptest.NewRequest("POST", "/", strings.NewReader(`{"ids": ["id1", "id2"], "project": "project"}`))
	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("Authorization", "Bearer token")
	h.ServeHTTP(w, r)
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, `["id1","id2"]`+"\n", w.Body.String())
}
