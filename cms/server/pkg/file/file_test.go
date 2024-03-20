package file

import (
	"io"
	"mime"
	"net/http"
	"os"
	"path"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFromURL(t *testing.T) {
	URL := "https://cms.com/xyz/test.txt"
	f := lo.Must(os.Open("testdata/test.txt"))
	defer f.Close()
	z := lo.Must(io.ReadAll(f))

	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponder("GET", URL, func(r *http.Request) (*http.Response, error) {
		res := httpmock.NewBytesResponse(200, z)
		res.Header.Set("Content-Type", mime.TypeByExtension(path.Ext(URL)))
		res.Header.Set("Content-Length", "123")
		res.Header.Set("Content-Disposition", `attachment; filename="filename.txt"`)
		return res, nil
	})

	expected := File{Name: "filename.txt", Content: f, Size: 123}

	got, err := FromURL(URL)
	assert.NoError(t, err)
	assert.Equal(t, expected.Name, got.Name)
	assert.Equal(t, z, lo.Must(io.ReadAll(got.Content)))

	httpmock.RegisterResponder("GET", URL, func(r *http.Request) (*http.Response, error) {
		res := httpmock.NewBytesResponse(200, z)
		res.Header.Set("Content-Type", mime.TypeByExtension(path.Ext(URL)))
		return res, nil
	})

	expected = File{Name: "test.txt", Content: f, Size: 0}

	got, err = FromURL(URL)
	assert.NoError(t, err)
	assert.Equal(t, expected.Name, got.Name)
	assert.Equal(t, z, lo.Must(io.ReadAll(got.Content)))
}
