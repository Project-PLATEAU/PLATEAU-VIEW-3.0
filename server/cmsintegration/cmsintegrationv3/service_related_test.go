package cmsintegrationv3

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"testing"

	"github.com/jarcoal/httpmock"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestConvertRelatedDataset(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()
	httpmock.RegisterResponder("GET", "https://example.com/hoge_border.geojson",
		httpmock.NewStringResponder(200, `{}`))

	var updatedFields [][]*cms.Field
	var updatedMetadataFields [][]*cms.Field
	var uploaded []string
	var comments []string
	ctx := context.Background()
	c := &cmsMock{
		asset: func(ctx context.Context, id string) (*cms.Asset, error) {
			return &cms.Asset{
				URL: "https://example.com/hoge_border.geojson",
			}, nil
		},
		updateItem: func(ctx context.Context, id string, fields []*cms.Field, metadataFields []*cms.Field) (*cms.Item, error) {
			updatedFields = append(updatedFields, fields)
			updatedMetadataFields = append(updatedMetadataFields, metadataFields)
			return nil, nil
		},
		uploadAssetDirectly: func(ctx context.Context, prjectID, name string, r io.Reader) (string, error) {
			uploaded = append(uploaded, name)
			return "asset", nil
		},
		commentToItem: func(ctx context.Context, id string, comment string) error {
			comments = append(comments, comment)
			return nil
		},
	}
	s := &Services{CMS: c, HTTP: http.DefaultClient}
	item := &RelatedItem{
		Items: map[string]RelatedItemDatum{
			"border": {
				ID:    "border",
				Asset: []string{"border"},
			},
		},
	}
	w := &cmswebhook.Payload{
		ItemData: &cmswebhook.ItemData{
			Model: &cms.Model{
				Key: "plateau-related",
			},
			Item: item.CMSItem(),
		},
	}

	t.Run("sucess", func(t *testing.T) {
		updatedFields = nil
		updatedMetadataFields = nil
		uploaded = nil
		comments = nil

		err := convertRelatedDataset(ctx, s, w, item)
		assert.NoError(t, err)
		assert.Equal(t, [][]*cms.Field{
			nil,
			{
				{
					Key:   "conv",
					Type:  "asset",
					Value: []string{"asset"},
					Group: "border",
				},
				{
					Key:   "border",
					Type:  "group",
					Value: "border",
				},
			},
		}, updatedFields)
		assert.Equal(t, [][]*cms.Field{
			{
				{Key: "border_status", Type: "tag", Value: string(ConvertionStatusRunning)},
			},
			{
				{Key: "border_status", Type: "tag", Value: string(ConvertionStatusSuccess)},
			},
		}, updatedMetadataFields)
		assert.Equal(t, []string{"hoge_border.czml"}, uploaded)
		assert.Equal(t, []string{"変換を開始しました。", "変換が完了しました。"}, comments)
	})
}

func TestPackRelatedDataset(t *testing.T) {
	mockGeoJSON := func(name string) map[string]any {
		return map[string]any{
			"type": "FeatureCollection",
			"features": []any{
				map[string]any{
					"type": "Feature",
					"properties": map[string]any{
						"name": name,
					},
					"geometry": map[string]any{
						"type":        "Point",
						"coordinates": []any{0.0, 0.0},
					},
				},
			},
		}
	}

	httpmock.Activate()
	defer httpmock.DeactivateAndReset()
	httpmock.RegisterResponder(
		"GET",
		`=~^https://example\.com/(.+)\.geojson`,
		func(req *http.Request) (*http.Response, error) {
			name := httpmock.MustGetSubmatch(req, 1)
			return httpmock.NewJsonResponse(200, mockGeoJSON(name))
		},
	)

	var updatedFields [][]*cms.Field
	var updatedMetadataFields [][]*cms.Field
	var uploadedData [][]byte
	var uploaded []string
	var comments []string
	ctx := context.Background()
	c := &cmsMock{
		getItem: func(ctx context.Context, id string, asset bool) (*cms.Item, error) {
			return (&CityItem{
				CityNameEn: "hoge",
				CityCode:   "00000",
			}).CMSItem(), nil
		},
		asset: func(ctx context.Context, id string) (*cms.Asset, error) {
			return &cms.Asset{
				URL: fmt.Sprintf("https://example.com/%s.geojson", id),
			}, nil
		},
		updateItem: func(ctx context.Context, id string, fields []*cms.Field, metadataFields []*cms.Field) (*cms.Item, error) {
			updatedFields = append(updatedFields, fields)
			updatedMetadataFields = append(updatedMetadataFields, metadataFields)
			return nil, nil
		},
		uploadAssetDirectly: func(ctx context.Context, prjectID, name string, r io.Reader) (string, error) {
			uploaded = append(uploaded, name)
			b := bytes.NewBuffer(nil)
			_, _ = io.Copy(b, r)
			uploadedData = append(uploadedData, b.Bytes())
			return "asset", nil
		},
		commentToItem: func(ctx context.Context, id string, comment string) error {
			comments = append(comments, comment)
			return nil
		},
	}
	s := &Services{CMS: c, HTTP: http.DefaultClient}
	item := &RelatedItem{
		City: "city",
		Items: map[string]RelatedItemDatum{
			"shelter":         {Asset: []string{"00000_hoge_city_2023_shelter"}},
			"landmark":        {Asset: []string{"00000_hoge_city_2023_00001_foo_landmark", "00000_hoge_city_2023_00002_bar_landmark"}},
			"station":         {Asset: []string{"00000_hoge_city_2023_station"}},
			"park":            {Asset: []string{"00000_hoge_city_2023_park"}},
			"railway":         {Asset: []string{"00000_hoge_city_2023_railway"}},
			"emergency_route": {Asset: []string{"00000_hoge_city_2023_emergency_route"}},
			"border":          {Asset: []string{"00000_hoge_city_2023_border"}},
		},
	}
	w := &cmswebhook.Payload{
		ItemData: &cmswebhook.ItemData{
			Model: &cms.Model{
				Key: "plateau-related",
			},
			Item: item.CMSItem(),
		},
	}

	t.Run("sucess", func(t *testing.T) {
		updatedFields = nil
		updatedMetadataFields = nil
		uploaded = nil
		comments = nil

		err := packRelatedDataset(ctx, s, w, item)
		assert.NoError(t, err)
		assert.Equal(t, [][]*cms.Field{
			nil,
			{
				{
					Key:   "merged",
					Type:  "asset",
					Value: "asset",
				},
			},
		}, updatedFields)
		assert.Equal(t, [][]*cms.Field{
			{
				{Key: "merge_status", Type: "tag", Value: string(ConvertionStatusRunning)},
			},
			{
				{Key: "merge_status", Type: "tag", Value: string(ConvertionStatusSuccess)},
			},
		}, updatedMetadataFields)
		assert.Equal(t, []string{"00000_hoge_2023_related.zip"}, uploaded)
		assert.Equal(t, []string{
			"G空間情報センター公開用zipファイルの作成を開始しました。",
			"G空間情報センター公開用zipファイルの作成が完了しました。",
		}, comments)

		zr, _ := zip.NewReader(bytes.NewReader(uploadedData[0]), int64(len(uploadedData[0])))
		assert.Equal(t, []string{
			"00000_hoge_city_2023_shelter.geojson",
			"00000_hoge_city_2023_park.geojson",
			"00000_hoge_city_2023_00001_foo_landmark.geojson",
			"00000_hoge_city_2023_00002_bar_landmark.geojson",
			"00000_hoge_city_2023_landmark.geojson",
			"00000_hoge_city_2023_station.geojson",
			"00000_hoge_city_2023_railway.geojson",
			"00000_hoge_city_2023_emergency_route.geojson",
			"00000_hoge_city_2023_border.geojson",
		}, lo.Map(zr.File, func(f *zip.File, _ int) string {
			return f.Name
		}))

		// assert 00000_hoge_city_2023_00001_foo_landmark.geojson
		zf := lo.Must(zr.Open("00000_hoge_city_2023_00001_foo_landmark.geojson"))
		var ge map[string]any
		_ = json.NewDecoder(zf).Decode(&ge)
		assert.Equal(t, mockGeoJSON("00000_hoge_city_2023_00001_foo_landmark"), ge)

		// assert 00000_hoge_city_2023_landmark.geojson
		zf = lo.Must(zr.Open("00000_hoge_city_2023_landmark.geojson"))
		ge = nil
		_ = json.NewDecoder(zf).Decode(&ge)
		assert.Equal(t, map[string]any{
			"type": "FeatureCollection",
			"name": "00000_hoge_city_2023_landmark",
			"features": []any{
				map[string]any{
					"type":       "Feature",
					"properties": map[string]any{"name": "00000_hoge_city_2023_00001_foo_landmark"},
					"geometry":   map[string]any{"type": "Point", "coordinates": []any{0.0, 0.0}},
				},
				map[string]any{
					"type":       "Feature",
					"properties": map[string]any{"name": "00000_hoge_city_2023_00002_bar_landmark"},
					"geometry":   map[string]any{"type": "Point", "coordinates": []any{0.0, 0.0}},
				},
			},
		}, ge)
	})
}

func TestParseRelatedAssetName(t *testing.T) {
	assert.Equal(t, &relatedAssetName{
		CityCode: "00000",
		CityName: "hoge",
		Provider: "city",
		Year:     2023,
		Type:     "landmark",
		Ext:      "geojson",
	}, parseRelatedAssetName("https://example.com/00000_hoge_city_2023_landmark.geojson"))

	assert.Equal(t, &relatedAssetName{
		CityCode: "27100",
		CityName: "osaka-shi",
		Provider: "city",
		Year:     2022,
		WardCode: "27103",
		WardName: "fukushima-ku",
		Type:     "shelter",
		Ext:      "geojson",
	}, parseRelatedAssetName("27100_osaka-shi_city_2022_27103_fukushima-ku_shelter.geojson"))

	assert.Equal(t, &relatedAssetName{
		CityCode: "27100",
		CityName: "osaka-shi",
		Provider: "city",
		Year:     2022,
		Type:     "emergency_route",
		Ext:      "geojson",
	}, parseRelatedAssetName("27100_osaka-shi_city_2022_emergency_route.geojson"))

	assert.Nil(t, parseRelatedAssetName("https://example.com/0000hoge_city_2023_landmark.geojson"))
}
