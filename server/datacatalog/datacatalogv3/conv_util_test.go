package datacatalogv3

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestOriginalAndConvsFrom(t *testing.T) {
	assert.Equal(t, []OriginalAndConv{
		{
			Original:  "https://example.com/xxx/baz.geojson",
			Converted: "https://example.com/baz.czml",
		},
		{
			Original:  "https://example.com/foo.geojson",
			Converted: "https://example.com/foo.czml",
		},
	}, OriginalAndConvsFrom(
		[]string{"https://example.com/foo.geojson", "https://example.com/xxx/baz.geojson"},
		[]string{"https://example.com/baz.czml", "https://example.com/foo.czml"},
	))
}

func TestNameWithoutExt(t *testing.T) {
	assert.Equal(t, "foo", nameWithoutExt("foo"))
	assert.Equal(t, "bar", nameWithoutExt("bar.json"))
}

func TestNameFromURL(t *testing.T) {
	assert.Equal(t, "foo", nameFromURL("https://example.com/foo"))
	assert.Equal(t, "bar.json", nameFromURL("bar.json"))
}
