package datacatalogv3

import (
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
)

const gespatialjpDatasetURL = "https://www.geospatial.jp/ckan/dataset/"

var plateauSpecVersions3 = []string{"3.0", "3.1", "3.2", "3.3", "3.4", "3.5"}

var plateauSpecs = []plateauapi.PlateauSpecSimple{
	{
		MajorVersion:  3,
		Year:          2023,
		MinorVersions: plateauSpecVersions3,
	},
}

var plateauFeatureTypes = []FeatureType{
	{
		Code: "bldg",
		Name: "建築物モデル",
	},
	{
		Code: "tran",
		Name: "交通（道路）モデル",
		MVTLayerNamesForLOD: map[int][]string{
			0: {"Road"},
			1: {"Road"},
			2: {"TrafficArea", "AuxiliaryTrafficArea"},
		},
	},
	{
		Code: "rwy",
		Name: "交通（鉄道）モデル",
		MVTLayerNamesForLOD: map[int][]string{
			0: {"Railway"},
			1: {"Railway"},
			2: {"TrafficArea", "AuxiliaryTrafficArea"},
		},
	},
	{
		Code: "trk",
		Name: "交通（徒歩道）モデル",
		MVTLayerNamesForLOD: map[int][]string{
			0: {"Track"},
			1: {"Track"},
			2: {"TrafficArea", "AuxiliaryTrafficArea"},
		},
	},
	{
		Code: "squr",
		Name: "交通（広場）モデル",
		MVTLayerNamesForLOD: map[int][]string{
			0: {"Square"},
			1: {"Square"},
			2: {"TrafficArea", "AuxiliaryTrafficArea"},
		},
	},
	{
		Code: "wwy",
		Name: "交通（航路）モデル",
		MVTLayerNamesForLOD: map[int][]string{
			0: {"Waterway"},
			1: {"Waterway"},
			2: {"TrafficArea"},
		},
	},
	{
		Code:         "luse",
		Name:         "土地利用モデル",
		MVTLayerName: []string{"luse"},
	},
	{
		Code:        "fld",
		Name:        "洪水浸水想定区域モデル",
		GroupName:   "災害リスク（浸水）モデル",
		Flood:       true,
		HideTexture: true,
	},
	{
		Code:        "tnm",
		Name:        "津波浸水想定区域モデル",
		GroupName:   "災害リスク（浸水）モデル",
		Flood:       true,
		HideTexture: true,
	},
	{
		Code:        "htd",
		Name:        "高潮浸水想定区域モデル",
		GroupName:   "災害リスク（浸水）モデル",
		Flood:       true,
		HideTexture: true,
	},
	{
		Code:        "ifld",
		Name:        "内水浸水想定区域モデル",
		GroupName:   "災害リスク（浸水）モデル",
		Flood:       true,
		HideTexture: true,
	},
	{
		Code:         "lsld",
		Name:         "土砂災害警戒区域モデル",
		GroupName:    "災害リスク（土砂災害）モデル",
		MVTLayerName: []string{"lsld"},
	},
	{
		Code: "urf",
		Name: "都市計画決定情報モデル",
	},
	{
		Code: "brid",
		Name: "橋梁モデル",
	},
	{
		Code: "tun",
		Name: "トンネルモデル",
	},
	{
		Code:         "cons",
		Name:         "その他の構造物モデル",
		MVTLayerName: []string{"OtherConstruction"},
	},
	{
		Code:         "frn",
		Name:         "都市設備モデル",
		MVTLayerName: []string{"CityFurniture"},
	},
	{
		Code: "unf",
		Name: "地下埋設物モデル",
	},
	{
		Code: "ubld",
		Name: "地下街モデル",
	},
	{
		Code: "veg",
		Name: "植生モデル",
	},
	{
		Code:         "wtr",
		Name:         "水部モデル",
		MVTLayerName: []string{"WaterBody"},
	},
	{
		Code: "dem",
		Name: "地形モデル",
	},
	{
		Code:         "area",
		Name:         "区域モデル",
		MVTLayerName: []string{"Zone"},
	},
	{
		Code:               "gen",
		Name:               "汎用都市オブジェクトモデル",
		MVTLayerNamePrefix: "gen",
	},
}

var relatedFeatureTypes = []FeatureType{
	{
		Code: "shelter",
		Name: "避難施設情報",
	},
	{
		Code: "landmark",
		Name: "ランドマーク情報",
	},
	{
		Code: "station",
		Name: "鉄道駅情報",
	},
	{
		Code: "emergency_route",
		Name: "緊急輸送道路情報",
	},
	{
		Code: "railway",
		Name: "鉄道情報",
	},
	{
		Code: "park",
		Name: "公園情報",
	},
	{
		Code: "border",
		Name: "行政界情報",
	},
}

var genericFeatureTypes = []FeatureType{
	{
		Code: "global",
		Name: "全球データ",
	},
	{
		Code: "usecase",
		Name: "ユースケース",
	},
	{
		Code: "sample",
		Name: "サンプルデータ",
	},
}

func init() {
	le := 1
	for i, t := range plateauFeatureTypes {
		t.Order = i + le
		t.SpecMajor = 3
		plateauFeatureTypes[i] = t
	}

	le += len(plateauFeatureTypes)
	for i, t := range relatedFeatureTypes {
		t.Order = i + le
		relatedFeatureTypes[i] = t
	}

	le += len(relatedFeatureTypes)
	for i, t := range genericFeatureTypes {
		t.Order = i + le
		genericFeatureTypes[i] = t
	}
}
