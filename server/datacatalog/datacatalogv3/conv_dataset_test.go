package datacatalogv3

import (
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/stretchr/testify/assert"
)

func TestAssetURLFromFormat(t *testing.T) {
	assert.Equal(t, "https://example.com/1111/a/tileset.json", assetURLFromFormat("https://example.com/1111/a.zip", plateauapi.DatasetFormatCesium3dtiles))
	assert.Equal(t, "https://example.com/1111/a/tileset.json", assetURLFromFormat("https://example.com/1111/a.7z", plateauapi.DatasetFormatCesium3dtiles))
	assert.Equal(t, "https://example.com/1111/a", assetURLFromFormat("https://example.com/1111/a", plateauapi.DatasetFormatCesium3dtiles))
	assert.Equal(t, "https://example.com/1111/a/{z}/{x}/{y}.mvt", assetURLFromFormat("https://example.com/1111/a.zip", plateauapi.DatasetFormatMvt))
	assert.Equal(t, "https://example.com/1111/a/{z}/{x}/{y}.mvt", assetURLFromFormat("https://example.com/1111/a.7z", plateauapi.DatasetFormatMvt))
	assert.Equal(t, "https://example.com/1111/a/{z}/{x}/{y}.mvt", assetURLFromFormat("https://example.com/1111/a/%7Bz%7D/%7Bx%7D/%7By%7D.mvt", plateauapi.DatasetFormatMvt))
	assert.Equal(t, "https://example.com/1111/a.zip", assetURLFromFormat("https://example.com/1111/a.zip", "hoge"))
	assert.Equal(t, "https://example.com/1111/a/a.czml", assetURLFromFormat("https://example.com/1111/a.zip", plateauapi.DatasetFormatCzml))
	assert.Equal(t, "https://example.com/1111/a", assetURLFromFormat("https://example.com/1111/a.zip", plateauapi.DatasetFormatTms))
}

func TestAssetRootPath(t *testing.T) {
	assert.Equal(t, "/example.com/1111/a", assetRootPath("/example.com/1111/a.zip"))
}

func TestStandardItemName(t *testing.T) {
	assert.Equal(t, "name（area）", standardItemName("name", "", "area"))
	assert.Equal(t, "name name2（area）", standardItemName("name", "name2", "area"))
	assert.Equal(t, "name", standardItemName("name", "", ""))
	assert.Equal(t, "name name2", standardItemName("name", "name2", ""))
	assert.Equal(t, "name（area）", standardItemName("name（area）", "", "area"))
	assert.Equal(t, "name name2（area）", standardItemName("name（area）", "name2", "area"))
}
