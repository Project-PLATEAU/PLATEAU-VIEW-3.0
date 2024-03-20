package preparegspatialjp

import (
	"archive/zip"
	"testing"

	"github.com/spf13/afero"
	"github.com/spf13/afero/zipfs"
	"github.com/stretchr/testify/assert"
)

func TestGenerateCityGMLIndexItem(t *testing.T) {
	zipPath := ""

	if zipPath == "" {
		t.Skip("zipPath is empty")
	}
	seed := &IndexSeed{}
	name := "name"
	size := uint64(1024 * 1024 * 1024) // 1GB
	zr, err := zip.OpenReader(zipPath)
	assert.NoError(t, err)
	f := afero.NewIOFS(zipfs.New(&zr.Reader))

	res, err := generateCityGMLIndexItem(seed, name, size, f)
	assert.NoError(t, err)

	text := renderIndexItem(res, 0)
	t.Log(text)
}
