package cmsintegrationv3

import (
	"testing"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/stretchr/testify/assert"
)

func TestCityItemFrom(t *testing.T) {
	item := &cms.Item{
		ID: "id",
		Fields: []*cms.Field{
			{
				Key:   "bldg",
				Type:  "reference",
				Value: "BLDG",
			},
		},
		MetadataFields: []*cms.Field{
			{
				Key:   "city_public",
				Type:  "bool",
				Value: true,
			},
			{
				Key:   "bldg_public",
				Type:  "bool",
				Value: true,
			},
		},
	}

	expected := &CityItem{
		ID: "id",
		References: map[string]string{
			"bldg": "BLDG",
		},
		Public: map[string]bool{
			"bldg": true,
		},
		CityPublic: true,
	}

	cityItem := CityItemFrom(item)
	assert.Equal(t, expected, cityItem)
	item2 := cityItem.CMSItem()
	assert.Equal(t, item, item2)
}

func TestFeatureItemFrom(t *testing.T) {
	item := &cms.Item{
		ID: "id",
		MetadataFields: []*cms.Field{
			{
				Key:  "conv_status",
				Type: "tag",
				Value: map[string]any{
					"id":   "xxx",
					"name": string(ConvertionStatusError),
				},
			},
		},
	}

	expected := &FeatureItem{
		ID: "id",
		ConvertionStatus: &cms.Tag{
			ID:   "xxx",
			Name: string(ConvertionStatusError),
		},
	}

	expected2 := &cms.Item{
		ID: "id",
		MetadataFields: []*cms.Field{
			{
				Key:   "conv_status",
				Type:  "tag",
				Value: "xxx",
			},
		},
	}

	featureItem := FeatureItemFrom(item)
	assert.Equal(t, expected, featureItem)
	item2 := featureItem.CMSItem()
	assert.Equal(t, expected2, item2)
}

func TestGenericItemFrom(t *testing.T) {
	item := &cms.Item{
		ID: "id",
		MetadataFields: []*cms.Field{
			{
				Key:   "public",
				Type:  "bool",
				Value: true,
			},
		},
	}

	expected := &GenericItem{
		ID:     "id",
		Public: true,
	}

	expected2 := &cms.Item{
		ID: "id",
		MetadataFields: []*cms.Field{
			{
				Key:   "public",
				Type:  "bool",
				Value: true,
			},
		},
	}

	genericItem := GenericItemFrom(item)
	assert.Equal(t, expected, genericItem)
	item2 := genericItem.CMSItem()
	assert.Equal(t, expected2, item2)
}

func TestRelatedItemFrom(t *testing.T) {
	item := &cms.Item{
		ID: "id",
		Fields: []*cms.Field{
			{
				Key:   "asset",
				Type:  "asset",
				Value: []string{"PARK"},
				Group: "park",
			},
			{
				Key:   "conv",
				Type:  "asset",
				Value: []string{"PARK_CONV"},
				Group: "park",
			},
			{
				Key:   "park",
				Type:  "group",
				Value: "park",
			},
			{
				Key:   "asset",
				Type:  "asset",
				Value: []string{"LANDMARK"},
				Group: "landmark",
			},
			{
				Key:   "landmark",
				Type:  "group",
				Value: "landmark",
			},
		},
		MetadataFields: []*cms.Field{
			{
				Key:   "park_status",
				Type:  "tag",
				Value: map[string]any{"id": "xxx", "name": string(ConvertionStatusSuccess)},
			},
			{
				Key:   "merge_status",
				Type:  "tag",
				Value: map[string]any{"id": "xxx", "name": string(ConvertionStatusSuccess)},
			},
		},
	}

	expected := &RelatedItem{
		ID: "id",
		Items: map[string]RelatedItemDatum{
			"park": {
				ID:        "park",
				Asset:     []string{"PARK"},
				Converted: []string{"PARK_CONV"},
			},
			"landmark": {
				ID:    "landmark",
				Asset: []string{"LANDMARK"},
			},
		},
		ConvertStatus: map[string]*cms.Tag{
			"park": {
				ID:   "xxx",
				Name: string(ConvertionStatusSuccess),
			},
		},
		MergeStatus: &cms.Tag{
			ID:   "xxx",
			Name: string(ConvertionStatusSuccess),
		},
	}

	expected2 := &cms.Item{
		ID: "id",
		Fields: []*cms.Field{
			{
				Key:   "asset",
				Type:  "asset",
				Value: []string{"PARK"},
				Group: "park",
			},
			{
				Key:   "conv",
				Type:  "asset",
				Value: []string{"PARK_CONV"},
				Group: "park",
			},
			{
				Key:   "park",
				Type:  "group",
				Value: "park",
			},
			{
				Key:   "asset",
				Type:  "asset",
				Value: []string{"LANDMARK"},
				Group: "landmark",
			},
			{
				Key:   "landmark",
				Type:  "group",
				Value: "landmark",
			},
		},
		MetadataFields: []*cms.Field{
			{
				Key:   "merge_status",
				Type:  "tag",
				Value: "xxx",
			},
			{
				Key:   "park_status",
				Type:  "tag",
				Value: string(ConvertionStatusSuccess),
			},
		},
	}

	relatedItem := RelatedItemFrom(item)
	assert.Equal(t, expected, relatedItem)
	item2 := relatedItem.CMSItem()
	assert.Equal(t, expected2, item2)
}
