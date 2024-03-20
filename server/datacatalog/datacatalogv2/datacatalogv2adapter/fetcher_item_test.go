package datacatalogv2adapter

import (
	"testing"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/stretchr/testify/assert"
)

func TestCMSItemToFetcherPlateauItem2(t *testing.T) {
	cmsItem := &cms.Item{
		ID: "id",
		Fields: []*cms.Field{
			{
				Key:   "citygml",
				Value: map[string]any{"id": "assetid", "url": "citygml"},
			},
			{
				Key:   "max_lod",
				Value: map[string]any{"url": "maxlod"},
			},
			{
				Key:   "bldg",
				Value: []any{map[string]any{"url": "bldg"}},
			},
			{
				Key:   "dem",
				Value: "有り",
			},
			{
				Key:   "sdk_publication",
				Value: "公開する",
			},
		},
	}

	expected := &fetcherPlateauItem2{
		ID:             "id",
		CityGMLURL:     "citygml",
		CityGMLAssetID: "assetid",
		MaxLODURL:      "maxlod",
		FeatureTypes:   []string{"bldg", "dem"},
		SDKPublic:      true,
	}

	actual := cmsItemToFetcherPlateauItem2(cmsItem)
	assert.Equal(t, expected, actual)
}
