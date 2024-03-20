package dataconv

import (
	"encoding/json"
	"os"
	"testing"

	geojson "github.com/paulmach/go.geojson"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/vincent-petithory/dataurl"
)

const borderName = "11238_hasuda-shi_border"

const border = `{
	"type" : "FeatureCollection",
	"name" : "` + borderName + `",
	"features" : [
		{
			"type" : "Feature",
			"geometry" : {
				"type" : "MultiLineString",
				"coordinates" : [
					[
						[ 139.6050448421, 36.0366165201 ],
						[ 139.6048803941, 36.0366387451 ],
						[ 139.604250394, 36.0367901312 ],
						[ 139.6050448421, 36.0366165201 ]
					]
				]
			},
			"properties" : {
				"prefecture_code" : "11",
				"prefecture_name" : "埼玉県",
				"city_code" : "11238",
				"city_name" : "蓮田市"
			}
		}
	]
}`

var expectedBorder = `[
	{
    "id": "document",
		"name": "11238_hasuda-shi_border",
    "version": "1.0"
  },
  {
    "id": "11238_hasuda-shi_border_1_1",
    "wall": {
      "material": {
        "image": {
					"image": "` + wallImageDataURL + `",
          "repeat": true,
          "transparent": true
        }
      },
      "positions": {
        "cartographicDegrees": [
					139.6050448421,
					36.0366165201,
					100,
					139.6048803941,
					36.0366387451,
					100,
					139.604250394,
					36.0367901312,
					100,
					139.6050448421,
					36.0366165201,
					100
				]
			}
		},
		"properties" : {
			"prefecture_code" : "11",
			"prefecture_name" : "埼玉県",
			"city_code" : "11238",
			"city_name" : "蓮田市"
		}
	}
]`

const landmarkName = "22205_atami-shi_landmark"

const landmark = `{
	"type": "FeatureCollection",
	"name": "` + landmarkName + `",
	"features": [
		{
			"type": "Feature",
			"properties": { "名称": "xxx外科医院", "種類": "病院", "高さ": 6.9873 },
			"geometry": { "type": "Point", "coordinates": [ 139.0706807, 35.09077376 ] }
		}
	]
}`

var expectedLandmarkImage string
var expectedLandmark string

func init() {
	expectedLandmarkImage = dataurl.EncodeBytes(lo.Must(GenerateLandmarkImage("xxx外科医院")))
	expectedLandmark = `[
		{
			"id": "document",
			"name": "22205_atami-shi_landmark",
			"version": "1.0"
		},
		{
			"billboard": {
				"eyeOffset": {
					"cartesian": [0, 0, 0]
				},
				"heightReference":  "RELATIVE_TO_GROUND",
				"horizontalOrigin": "CENTER",
				"image": "` + expectedLandmarkImage + `",
				"pixelOffset": {
					"cartesian2": [0, 0]
				},
				"scale": 1,
				"show": true,
				"sizeInMeters": true,
				"verticalOrigin": "BOTTOM"
			},
			"description": "xxx外科医院",
			"id": "22205_atami-shi_landmark_1",
			"name": "xxx外科医院",
			"position": {
				"cartographicDegrees": [
					139.0706807,
					35.09077376,
					6.9873
				]
			},
			"properties" : {
				"名称": "xxx外科医院",
				"種類": "病院",
				"高さ": 6.9873
			}
		}
	]`
}

func TestConvertBorder(t *testing.T) {
	var fc *geojson.FeatureCollection
	assert.NoError(t, json.Unmarshal([]byte(border), &fc))

	res, err := ConvertBorder(fc, borderName)
	assert.NoError(t, err)

	var expectedBorderJSON any
	assert.NoError(t, json.Unmarshal([]byte(expectedBorder), &expectedBorderJSON))

	assert.Equal(t, expectedBorderJSON, res)
}

func TestConvertLandmark(t *testing.T) {
	var fc *geojson.FeatureCollection
	assert.NoError(t, json.Unmarshal([]byte(landmark), &fc))

	res, err := ConvertLandmark(fc, landmarkName)
	assert.NoError(t, err)

	var expectedLandmarkJSON any
	assert.NoError(t, json.Unmarshal([]byte(expectedLandmark), &expectedLandmarkJSON))

	assert.Equal(t, expectedLandmarkJSON, res)
}

func TestGenerateLandmarkImage(t *testing.T) {
	image, err := GenerateLandmarkImage("日本カメラ博物館")
	require.NoError(t, err)
	require.NoError(t, os.WriteFile("test.png", image, 0666))
}

func TestProcessProperties(t *testing.T) {
	var m map[string]any
	_ = json.Unmarshal([]byte(`{"名称":"a","高さ":null}`), &m)
	assert.Equal(t, map[string]any{"名称": "a"}, processProperties(m))
}

func TestConvertLandmark2(t *testing.T) {
	filepath := ""
	if filepath == "" {
		t.Skip("no filepath")
	}

	data, err := os.ReadFile(filepath)
	assert.NoError(t, err)

	var fc *geojson.FeatureCollection
	assert.NoError(t, json.Unmarshal(data, &fc))

	// fc.Features = fc.Features[0 : len(fc.Features)/2]

	res, err := ConvertLandmark(fc, landmarkName)
	assert.NoError(t, err)

	j, _ := json.MarshalIndent(res, "", "  ")

	err = os.WriteFile("test.czml", j, 0666)
	assert.NoError(t, err)
}
