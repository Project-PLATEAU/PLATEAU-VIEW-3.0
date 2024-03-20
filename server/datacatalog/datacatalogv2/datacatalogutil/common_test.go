package datacatalogutil

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAssetURLFromFormat(t *testing.T) {
	assert.Equal(t, "https://example.com/1111/a/tileset.json", AssetURLFromFormat("https://example.com/1111/a.zip", "3dtiles"))
	assert.Equal(t, "https://example.com/1111/a/tileset.json", AssetURLFromFormat("https://example.com/1111/a.7z", "3dtiles"))
	assert.Equal(t, "https://example.com/1111/a", AssetURLFromFormat("https://example.com/1111/a", "3dtiles"))
	assert.Equal(t, "https://example.com/1111/a/{z}/{x}/{y}.mvt", AssetURLFromFormat("https://example.com/1111/a.zip", "mvt"))
	assert.Equal(t, "https://example.com/1111/a/{z}/{x}/{y}.mvt", AssetURLFromFormat("https://example.com/1111/a.7z", "mvt"))
	assert.Equal(t, "https://example.com/1111/a/{z}/{x}/{y}.mvt", AssetURLFromFormat("https://example.com/1111/a/%7Bz%7D/%7Bx%7D/%7By%7D.mvt", "mvt"))
	assert.Equal(t, "https://example.com/1111/a.zip", AssetURLFromFormat("https://example.com/1111/a.zip", "hoge"))
	assert.Equal(t, "https://example.com/1111/a/a.czml", AssetURLFromFormat("https://example.com/1111/a.zip", "czml"))
	assert.Equal(t, "https://example.com/1111/a", AssetURLFromFormat("https://example.com/1111/a.zip", "tms"))
}

func TestAssetRootPath(t *testing.T) {
	assert.Equal(t, "/example.com/1111/a", AssetRootPath("/example.com/1111/a.zip"))
}

func TestCityCode(t *testing.T) {
	c := CityCode("xxx", "大阪市", "", 27)
	assert.Equal(t, "xxx", c)

	c = CityCode("", "大阪市", "", 27)
	assert.Equal(t, "27100", c)

	c = CityCode("", "千代田区", "", 13)
	assert.Equal(t, "13101", c)

	c = CityCode("", "", "千代田区", 13)
	assert.Equal(t, "13101", c)

	c = CityCode("", "大阪市", "西区", 0)
	assert.Empty(t, c)

	c = CityCode("", "大阪市", "西区", 27)
	assert.Equal(t, "27106", c)

	c = CityCode("", "堺市", "西区", 27)
	assert.Equal(t, "27144", c)

	c = CityCode("", "堺市", "北区", 27)
	assert.Equal(t, "27146", c)
}
