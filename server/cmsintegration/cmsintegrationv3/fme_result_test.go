package cmsintegrationv3

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFMEID(t *testing.T) {
	i := fmeID{ItemID: "item", FeatureType: "bldg", ProjectID: "project", Type: "qc_conv"}
	assert.Equal(t, i, lo.Must(parseFMEID(i.String("aaa"), "aaa")))
	_, err := parseFMEID(i.String("aaa"), "aaa2")
	assert.Same(t, ErrInvalidFMEID, err)
}

func TestFMEResult_GetResultURLs(t *testing.T) {
	r := fmeResult{
		Results: map[string]any{
			"_dic":                            "https://example.com/04100_sendai-shi_2022_citygml_1/dic.json",
			"_maxlod":                         "https://example.com/04100_sendai-shi_2022_citygml_1/maxlod.csv",
			"26103_bldg_lod1":                 "https://example.com/04100_sendai-shi_2022_citygml_1/26103_bldg_lod1.zip",
			"bldg_lod2":                       "https://example.com/04100_sendai-shi_2022_citygml_1/bldg_lod2.zip",
			"lsld":                            []any{"https://example.com/04100_sendai-shi_2022_citygml_1/lsld.zip"},
			"urf/AreaClassification":          []string{"https://example.com/04100_sendai-shi_2022_citygml_1/AreaClassification.zip"},
			"urf/FirePreventionDistrict":      "https://example.com/04100_sendai-shi_2022_citygml_1/FirePreventionDistrict.zip",
			"urf/HeightControlDistrict":       "https://example.com/04100_sendai-shi_2022_citygml_1/HeightControlDistrict.zip",
			"urf/HighLevelUseDistrict":        "https://example.com/04100_sendai-shi_2022_citygml_1/HighLevelUseDistrict.zip",
			"urf/LandscapeZone":               "https://example.com/04100_sendai-shi_2022_citygml_1/LandscapeZone.zip",
			"urf/ParkingPlaceDevelopmentZone": "https://example.com/04100_sendai-shi_2022_citygml_1/ParkingPlaceDevelopmentZone.zip",
			"urf/PortZone":                    "https://example.com/04100_sendai-shi_2022_citygml_1/PortZone.zip",
			"urf/ScenicDistrict":              "https://example.com/04100_sendai-shi_2022_citygml_1/ScenicDistrict.zip",
			"urf/SpecialGreenSpaceConservationDistrict": "https://example.com/04100_sendai-shi_2022_citygml_1/SpecialGreenSpaceConservationDistrict.zip",
			"urf/SpecialUrbanRenaissanceDistrict":       "https://example.com/04100_sendai-shi_2022_citygml_1/SpecialUrbanRenaissanceDistrict.zip",
			"urf/SpecialUseDistrict":                    "https://example.com/04100_sendai-shi_2022_citygml_1/SpecialUseDistrict.zip",
			"urf/UrbanPlanningArea":                     "https://example.com/04100_sendai-shi_2022_citygml_1/UrbanPlanningArea.zip",
			"urf/UseDistrict":                           "https://example.com/04100_sendai-shi_2022_citygml_1/UseDistrict.zip",
			"hoge":                                      "hoge",
			"foo":                                       "foo",
			"fld/aaa/bbbb_l1":                           []string{"fld1", "fld2"},
			"fld/aaa/bbbb_l2":                           "fld3",
			"fld/aaa/bbbb_l2_no_texture":                "fld4",
		},
	}

	assert.Equal(t, fmeResultURLs{
		FeatureType: "bldg",
		Data: []string{
			"https://example.com/04100_sendai-shi_2022_citygml_1/26103_bldg_lod1.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/bldg_lod2.zip",
		},
		Keys: []string{"bldg"},
		DataMap: map[string][]string{
			"bldg": {
				"https://example.com/04100_sendai-shi_2022_citygml_1/26103_bldg_lod1.zip",
				"https://example.com/04100_sendai-shi_2022_citygml_1/bldg_lod2.zip",
			},
		},
		Dic:    "https://example.com/04100_sendai-shi_2022_citygml_1/dic.json",
		MaxLOD: "https://example.com/04100_sendai-shi_2022_citygml_1/maxlod.csv",
	}, r.GetResultURLs("bldg"))

	assert.Equal(t, fmeResultURLs{
		FeatureType: "lsld",
		Data: []string{
			"https://example.com/04100_sendai-shi_2022_citygml_1/lsld.zip",
		},
		Keys: []string{"lsld"},
		DataMap: map[string][]string{
			"lsld": {"https://example.com/04100_sendai-shi_2022_citygml_1/lsld.zip"},
		},
		Dic:    "https://example.com/04100_sendai-shi_2022_citygml_1/dic.json",
		MaxLOD: "https://example.com/04100_sendai-shi_2022_citygml_1/maxlod.csv",
	}, r.GetResultURLs("lsld"))

	assert.Equal(t, fmeResultURLs{
		FeatureType: "urf",
		Data: []string{
			"https://example.com/04100_sendai-shi_2022_citygml_1/AreaClassification.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/FirePreventionDistrict.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/HeightControlDistrict.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/HighLevelUseDistrict.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/LandscapeZone.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/ParkingPlaceDevelopmentZone.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/PortZone.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/ScenicDistrict.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/SpecialGreenSpaceConservationDistrict.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/SpecialUrbanRenaissanceDistrict.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/SpecialUseDistrict.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/UrbanPlanningArea.zip",
			"https://example.com/04100_sendai-shi_2022_citygml_1/UseDistrict.zip",
		},
		Keys: []string{
			"urf/AreaClassification",
			"urf/FirePreventionDistrict",
			"urf/HeightControlDistrict",
			"urf/HighLevelUseDistrict",
			"urf/LandscapeZone",
			"urf/ParkingPlaceDevelopmentZone",
			"urf/PortZone",
			"urf/ScenicDistrict",
			"urf/SpecialGreenSpaceConservationDistrict",
			"urf/SpecialUrbanRenaissanceDistrict",
			"urf/SpecialUseDistrict",
			"urf/UrbanPlanningArea",
			"urf/UseDistrict",
		},
		DataMap: map[string][]string{
			"urf/AreaClassification":                    {"https://example.com/04100_sendai-shi_2022_citygml_1/AreaClassification.zip"},
			"urf/FirePreventionDistrict":                {"https://example.com/04100_sendai-shi_2022_citygml_1/FirePreventionDistrict.zip"},
			"urf/HeightControlDistrict":                 {"https://example.com/04100_sendai-shi_2022_citygml_1/HeightControlDistrict.zip"},
			"urf/HighLevelUseDistrict":                  {"https://example.com/04100_sendai-shi_2022_citygml_1/HighLevelUseDistrict.zip"},
			"urf/LandscapeZone":                         {"https://example.com/04100_sendai-shi_2022_citygml_1/LandscapeZone.zip"},
			"urf/ParkingPlaceDevelopmentZone":           {"https://example.com/04100_sendai-shi_2022_citygml_1/ParkingPlaceDevelopmentZone.zip"},
			"urf/PortZone":                              {"https://example.com/04100_sendai-shi_2022_citygml_1/PortZone.zip"},
			"urf/ScenicDistrict":                        {"https://example.com/04100_sendai-shi_2022_citygml_1/ScenicDistrict.zip"},
			"urf/SpecialGreenSpaceConservationDistrict": {"https://example.com/04100_sendai-shi_2022_citygml_1/SpecialGreenSpaceConservationDistrict.zip"},
			"urf/SpecialUrbanRenaissanceDistrict":       {"https://example.com/04100_sendai-shi_2022_citygml_1/SpecialUrbanRenaissanceDistrict.zip"},
			"urf/SpecialUseDistrict":                    {"https://example.com/04100_sendai-shi_2022_citygml_1/SpecialUseDistrict.zip"},
			"urf/UrbanPlanningArea":                     {"https://example.com/04100_sendai-shi_2022_citygml_1/UrbanPlanningArea.zip"},
			"urf/UseDistrict":                           {"https://example.com/04100_sendai-shi_2022_citygml_1/UseDistrict.zip"},
		},
		Dic:    "https://example.com/04100_sendai-shi_2022_citygml_1/dic.json",
		MaxLOD: "https://example.com/04100_sendai-shi_2022_citygml_1/maxlod.csv",
	}, r.GetResultURLs("urf"))

	assert.Equal(t, fmeResultURLs{
		FeatureType: "fld",
		Data: []string{
			"fld1", "fld2", "fld3", "fld4",
		},
		Keys: []string{
			"fld/aaa/bbbb",
		},
		DataMap: map[string][]string{
			"fld/aaa/bbbb": {"fld1", "fld2", "fld3", "fld4"},
		},
		Dic:    "https://example.com/04100_sendai-shi_2022_citygml_1/dic.json",
		MaxLOD: "https://example.com/04100_sendai-shi_2022_citygml_1/maxlod.csv",
	}, r.GetResultURLs("fld"))
}
