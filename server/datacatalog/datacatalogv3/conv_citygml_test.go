package datacatalogv3

import (
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/stretchr/testify/assert"
)

func TestToCityGMLs(t *testing.T) {
	regYear := 2023

	all := &AllData{
		City: []*CityItem{
			{
				ID:         "city1",
				Prefecture: "東京都",
				CityName:   "東京都23区",
				CityNameEn: "tokyo23ku",
				CityCode:   "13100",
				Spec:       "第3.3版",
				Year:       "2023",
				SDKPublic:  true,
			},
		},
		GeospatialjpDataItems: []*GeospatialjpDataItem{
			{
				City:    "city1",
				CityGML: "https://example.com/city1.gml",
				MaxLOD:  "https://example.com/maxlod1.csv",
			},
		},
		Plateau: map[string][]*PlateauFeatureItem{
			"bldg": {
				{
					City:    "city1",
					CityGML: "https://example.com/city3.gml",
				},
			},
			"ubld": {
				{
					City:    "city1",
					Sample:  true,
					CityGML: "https://example.com/city2.gml",
					MaxLOD:  "https://example.com/maxlod2.csv",
				},
			},
		},
		FeatureTypes: FeatureTypes{
			Plateau: []FeatureType{
				{
					Code: "bldg",
				},
				{
					Code: "ubld",
				},
			},
		},
	}

	expected := map[plateauapi.ID]*plateauapi.CityGMLDataset{
		"cg_13100": {
			ID:                 "cg_13100",
			Year:               2023,
			RegistrationYear:   regYear,
			URL:                "https://example.com/city1.gml",
			PrefectureID:       "p_13",
			PrefectureCode:     "13",
			CityID:             "c_13100",
			CityCode:           "13100",
			PlateauSpecMinorID: "ps_3.3",
			FeatureTypes:       []string{"bldg", "ubld"},
			Admin: map[string]any{
				"citygmlUrl": []string{
					"https://example.com/city1.gml",
					"https://example.com/city2.gml",
				},
				"maxlod": []string{
					"https://example.com/maxlod1.csv",
					"https://example.com/maxlod2.csv",
				},
			},
		},
	}

	res, warnings := toCityGMLs(all, regYear)
	assert.Nil(t, warnings)
	assert.Equal(t, expected, res)
}
