package cmsintegrationv3

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/jarcoal/httpmock"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/stretchr/testify/assert"
)

func TestParseSetupCSV(t *testing.T) {
	tests := []struct {
		name             string
		csvData          string
		expected         []SetupCSVItem
		expectedFeatures []string
		err              error
	}{
		{
			name: "valid csv",
			csvData: `city_code,city,city_en,pref,Feature1,Feature2,Feature3
99999,八王子市,hachioji-shi,東京都,Yes,,Yes
99998,東村山市,higashimurayama-shi,東京都,Yes,Yes,`,
			expected: []SetupCSVItem{
				{
					Name:       "八王子市",
					NameEn:     "hachioji-shi",
					Code:       "99999",
					Prefecture: "東京都",
					Features:   []string{"Feature1", "Feature3"},
				},
				{
					Name:       "東村山市",
					NameEn:     "higashimurayama-shi",
					Code:       "99998",
					Prefecture: "東京都",
					Features:   []string{"Feature1", "Feature2"},
				},
			},
			expectedFeatures: []string{"Feature1", "Feature2", "Feature3"},
			err:              nil,
		},
		{
			name:             "empty csv",
			csvData:          "",
			expected:         nil,
			expectedFeatures: nil,
			err:              io.EOF,
		},
		{
			name: "invalid header",
			csvData: `city,city_en
八王子市,hachioji-shi`,
			expected:         nil,
			expectedFeatures: nil,
			err:              fmt.Errorf("invalid header: [city city_en]"),
		},
		{
			name: "invalid row",
			csvData: `city,city_en,pref,Feature1
八王子市,hachioji-shi,東京都`,
			expected: nil,
			err:      fmt.Errorf("record on line 2: wrong number of fields"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := strings.NewReader(tt.csvData)
			items, features, err := parseSetupCSV(r)

			if tt.err != nil {
				assert.EqualError(t, err, tt.err.Error())
			} else {
				assert.NoError(t, err)
			}

			assert.Equal(t, tt.expected, items)
			assert.Equal(t, tt.expectedFeatures, features)
		})
	}
}

func TestSetupCityItems(t *testing.T) {
	ctx := context.Background()
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "https://example.com/data.csv",
		httpmock.NewStringResponder(200, `city,city_en,pref,bldg,tran,luse
八王子市,hachioji-shi,東京都,Yes,,Yes
東村山市,higashimurayama-shi,東京都,Yes,Yes,`))

	var createdItems []*cms.Item
	var updateditems []*cms.Item

	s := &Services{
		CMS: &cmsMock{
			getModels: func(ctx context.Context, projectID string) (*cms.Models, error) {
				return &cms.Models{
					Models: []cms.Model{
						{
							ID:  "city",
							Key: "plateau-city",
						},
						{
							ID:  "bldg",
							Key: "plateau-bldg",
						},
						{
							ID:  "tran",
							Key: "plateau-tran",
						},
						{
							ID:  "luse",
							Key: "plateau-luse",
						},
						{
							ID:  "related",
							Key: "plateau-related",
						},
						{
							ID:  "geospatialjp-index",
							Key: "plateau-geospatialjp-index",
						},
						{
							ID:  "geospatialjp-data",
							Key: "plateau-geospatialjp-data",
						},
					},
				}, nil
			},
			getItemsPartially: func(ctx context.Context, modelID string, page, perPage int, asset bool) (*cms.Items, error) {
				return &cms.Items{
					TotalCount: 0,
				}, nil
			},
			createItem: func(ctx context.Context, modelID string, fields []*cms.Field, metadataFields []*cms.Field) (*cms.Item, error) {
				item := &cms.Item{
					ID:             fmt.Sprintf("item%d", len(createdItems)),
					ModelID:        modelID,
					Fields:         fields,
					MetadataFields: metadataFields,
				}
				createdItems = append(createdItems, item)
				return item, nil
			},
			updateItem: func(ctx context.Context, itemID string, fields []*cms.Field, metadataFields []*cms.Field) (*cms.Item, error) {
				item := &cms.Item{
					ID:             itemID,
					Fields:         fields,
					MetadataFields: metadataFields,
				}
				updateditems = append(updateditems, item)
				return item, nil
			},
		},
		HTTP: http.DefaultClient,
	}

	inp := SetupCityItemsInput{
		ProjectID: "project123",
		DataURL:   "https://example.com/data.csv",
	}

	onprogress := func(i, l int, c SetupCSVItem) {}

	t.Run("success", func(t *testing.T) {
		createdItems = nil
		updateditems = nil
		err := SetupCityItems(ctx, s, inp, onprogress)
		assert.NoError(t, err)

		assert.Equal(t, 14, len(createdItems))
		assertCityItem(t, &CityItem{
			ID:         "item0",
			CityName:   "八王子市",
			CityNameEn: "hachioji-shi",
			CityCode:   "13201",
			Prefecture: "東京都",
		}, createdItems[0])
		assertFeatureItem(t, "related", "item0", "", createdItems[1])
		assertFeatureItem(t, "geospatialjp-index", "item0", "", createdItems[2])
		assertFeatureItem(t, "geospatialjp-data", "item0", "", createdItems[3])
		assertFeatureItem(t, "bldg", "item0", "", createdItems[4])
		assertFeatureItem(t, "tran", "item0", ManagementStatusSkip, createdItems[5])
		assertFeatureItem(t, "luse", "item0", "", createdItems[6])
		assertCityItem(t, &CityItem{
			ID:         "item7",
			CityName:   "東村山市",
			CityNameEn: "higashimurayama-shi",
			CityCode:   "13213",
			Prefecture: "東京都",
		}, createdItems[7])
		assertFeatureItem(t, "related", "item7", "", createdItems[8])
		assertFeatureItem(t, "geospatialjp-index", "item7", "", createdItems[9])
		assertFeatureItem(t, "geospatialjp-data", "item7", "", createdItems[10])
		assertFeatureItem(t, "bldg", "item7", "", createdItems[11])
		assertFeatureItem(t, "tran", "item7", "", createdItems[12])
		assertFeatureItem(t, "luse", "item7", ManagementStatusSkip, createdItems[13])

		assert.Equal(t, 2, len(updateditems))
		assertUpdatedCityItem(t, &CityItem{
			ID: "item0",
			References: map[string]string{
				"bldg": "item4",
				"tran": "item5",
				"luse": "item6",
			},
			RelatedDataset:    "item1",
			GeospatialjpIndex: "item2",
			GeospatialjpData:  "item3",
		}, updateditems[0])
		assertUpdatedCityItem(t, &CityItem{
			ID: "item7",
			References: map[string]string{
				"bldg": "item11",
				"tran": "item12",
				"luse": "item13",
			},
			RelatedDataset:    "item8",
			GeospatialjpIndex: "item9",
			GeospatialjpData:  "item10",
		}, updateditems[1])
	})
}

func assertCityItem(t *testing.T, expected *CityItem, actual *cms.Item) {
	t.Helper()
	assert.Equal(t, "city", actual.ModelID)
	a := CityItemFrom(actual)
	am := &CityItem{
		ID:         a.ID,
		CityName:   a.CityName,
		CityNameEn: a.CityNameEn,
		CityCode:   a.CityCode,
		Prefecture: a.Prefecture,
	}
	assert.Equal(t, expected, am)
}

func assertFeatureItem(t *testing.T, expectedModel, expectedCity string, status ManagementStatus, actual *cms.Item) {
	t.Helper()
	assert.Equal(t, expectedModel, actual.ModelID, "model of "+actual.ID)
	assert.Equal(t, expectedCity, actual.FieldByKey("city").GetValue().Interface(), "city of "+actual.ID)
	statusv := actual.MetadataFieldByKey("status").GetValue().Interface()
	if status == "" {
		assert.Nil(t, statusv, "status of "+actual.ID)
		return
	}
	assert.Equal(t, string(status), statusv, "status of "+actual.ID)
}

func assertUpdatedCityItem(t *testing.T, expected *CityItem, actual *cms.Item) {
	t.Helper()
	a := CityItemFrom(actual)
	am := &CityItem{
		ID:                a.ID,
		References:        a.References,
		RelatedDataset:    a.RelatedDataset,
		GeospatialjpIndex: a.GeospatialjpIndex,
		GeospatialjpData:  a.GeospatialjpData,
	}
	assert.Equal(t, expected, am)
}
