package datacatalogutil

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDescriptionFrom(t *testing.T) {
	assert.Equal(t, Description{
		Desc: "aaa",
		Tags: map[string]string{
			"name":         "bbb",
			"datasetOrder": "12",
		},
	}, DescriptionFrom("@name: bbb\n@datasetOrder: 12\n\naaa"))
}

func TestExtractTags(t *testing.T) {
	tags, rest := extractTags("\n\n@name: CCC\n@aaa: bbb\n\n@type: DDD\n\n@layer: aaa,bbb,ccc\n@order: 1\n\naaaa\nbbbb")
	assert.Equal(t, map[string]string{
		"name":  "CCC",
		"aaa":   "bbb",
		"type":  "DDD",
		"layer": "aaa,bbb,ccc",
		"order": "1",
	}, tags)
	assert.Equal(t, "aaaa\nbbbb", rest)

	tags, rest = extractTags("aaaa\nbbbb")
	assert.Equal(t, map[string]string{}, tags)
	assert.Equal(t, "aaaa\nbbbb", rest)
}
