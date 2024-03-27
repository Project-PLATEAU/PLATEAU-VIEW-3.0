package datacatalogv3

import (
	"encoding/json"
	"testing"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/stretchr/testify/assert"
)

func TestPlateauFeatureItemFrom(t *testing.T) {
	item := &cms.Item{
		ID: "id",
		Fields: []*cms.Field{
			{
				Key: "data",
				Value: []any{
					map[string]any{"url": "url1"},
					map[string]any{"url": "url2"},
				},
			},
			{
				Key:   "maxlod",
				Value: map[string]any{"url": "url_maxlod"},
			},
			{
				Key:   "citygml",
				Value: map[string]any{"url": "url_citygml"},
			},
			{
				Key:   "items",
				Type:  "group",
				Value: []any{"item1", "item2"},
			},
			{
				Key:   "data",
				Group: "item1",
				Value: []any{map[string]any{"url": "url3"}},
			},
			{
				Key:   "data",
				Group: "item2",
				Value: []any{"url4"}, // string is ignored
			},
			{
				Key:   "feature_type",
				Value: "交通（道路）モデル（tran）",
			},
		},
	}

	expected := &PlateauFeatureItem{
		ID:          "id",
		Data:        []string{"url1", "url2"},
		CityGML:     "url_citygml",
		MaxLOD:      "url_maxlod",
		FeatureType: "tran",
		Items: []PlateauFeatureItemDatum{
			{
				ID:   "item1",
				Data: []string{"url3"},
			},
			{
				ID: "item2",
			},
		},
	}

	assert.Equal(t, expected, PlateauFeatureItemFrom(item, "code"))
}

func TestGenericItemFrom(t *testing.T) {
	item := &cms.Item{
		ID: "id",
		Fields: []*cms.Field{
			{
				Key:   "items",
				Type:  "group",
				Value: []any{"item1"},
			},
			{
				Key:   "data",
				Group: "item1",
				Value: map[string]any{"url": "url1"},
			},
			{
				Key:   "desc",
				Group: "item1",
				Value: "desc1",
			},
		},
	}

	expected := &GenericItem{
		ID: "id",
		Items: []GenericItemDataset{
			{
				ID:   "item1",
				Data: "url1",
				Desc: "desc1",
			},
		},
	}

	assert.Equal(t, expected, GenericItemFrom(item))
}

func TestRelatedItemFrom(t *testing.T) {
	item := &cms.Item{
		ID: "id",
		Fields: []*cms.Field{
			{
				Key:   "hoge",
				Type:  "group",
				Value: "hoge",
			},
			{
				Key:   "foo",
				Type:  "group",
				Value: "foo",
			},
			{
				Key:   "asset",
				Value: []any{map[string]any{"url": "url1"}},
				Group: "hoge",
			},
			{
				Key:   "conv",
				Value: []any{map[string]any{"url": "url2"}},
				Group: "hoge",
			},
			{
				Key:   "description",
				Value: "desc1",
				Group: "hoge",
			},
			{
				Key:   "asset",
				Value: []any{map[string]any{"url": "url3"}},
				Group: "foo",
			},
			{
				Key:   "description",
				Value: "desc2",
				Group: "foo",
			},
		},
	}

	ft := []FeatureType{
		{
			Code: "hoge",
		},
		{
			Code: "foo",
		},
	}

	expected := &RelatedItem{
		ID: "id",
		Items: map[string]RelatedItemDatum{
			"hoge": {
				ID:          "hoge",
				Asset:       []string{"url1"},
				Converted:   []string{"url2"},
				Description: "desc1",
			},
			"foo": {
				ID:          "foo",
				Asset:       []string{"url3"},
				Description: "desc2",
			},
		},
	}

	assert.Equal(t, expected, RelatedItemFrom(item, ft))
}

func TestValueToAssetURLs(t *testing.T) {
	assert.Nil(t, valueToAssetURLs(cms.NewValue("string")))
	assert.Nil(t, valueToAssetURLs(cms.NewValue(map[string]string{"aaa": "bbb"})))
	assert.Equal(t, []string{"url"}, valueToAssetURLs(cms.NewValue(map[string]any{"url": "url"})))
	assert.Equal(t, []string{"url"}, valueToAssetURLs(cms.NewValue(map[any]any{"url": "url"})))
	assert.Equal(t, []string{"url", "url2"}, valueToAssetURLs(cms.NewValue([]any{
		map[string]any{"url": "url"}, map[any]any{"url": "url2"}, map[string]any{},
	})))
}

func TestStringOrNumber(t *testing.T) {
	stringOrNumber := &StringOrNumber{}
	assert.NoError(t, json.Unmarshal([]byte(`"string"`), stringOrNumber))
	assert.Equal(t, "string", stringOrNumber.String())

	stringOrNumber = &StringOrNumber{}
	assert.NoError(t, json.Unmarshal([]byte(`123`), stringOrNumber))
	assert.Equal(t, "123", stringOrNumber.String())

	stringOrNumber = &StringOrNumber{}
	assert.NoError(t, json.Unmarshal([]byte(`123.456`), stringOrNumber))
	assert.Equal(t, "123.456000", stringOrNumber.String())
}
