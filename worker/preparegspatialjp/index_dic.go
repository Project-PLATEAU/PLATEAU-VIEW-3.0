package preparegspatialjp

const udx = "udx"
const indexmap = "_indexmap_op.pdf"

var citygmlDic = map[string]string{
	"codelists":     "コードリスト",
	"metadata":      "メタデータ",
	"schemas":       "CityGMLスキーマ",
	"specification": "3D都市モデルのための拡張製品仕様書",
	"indexmap":      "索引図（PDF）",
	"natl":          "国管理",
	"pref":          "都道府県管理",
}

var featureTypees = map[string]string{
	"bldg": "建築物モデル",
	"tran": "交通（道路）モデル",
	"rwy":  "交通（鉄道）モデル",
	"trk":  "交通（徒歩道）モデル",
	"squr": "交通（広場）モデル",
	"wwy":  "交通（航路）モデル",
	"luse": "土地利用モデル",
	"fld":  "洪水浸水想定区域モデル",
	"tnm":  "津波浸水想定区域モデル",
	"htd":  "高潮浸水想定区域モデル",
	"ifld": "内水浸水想定区域モデル",
	"lsld": "土砂災害警戒区域モデル",
	"urf":  "都市計画決定情報モデル",
	"brid": "橋梁モデル",
	"tun":  "トンネルモデル",
	"cons": "その他の構造物モデル",
	"frn":  "都市設備モデル",
	"unf":  "地下埋設物モデル",
	"ubld": "地下街モデル",
	"veg":  "植生モデル",
	"wtr":  "水部モデル",
	"dem":  "地形モデル",
	"area": "区域モデル",
	"gen":  "汎用都市オブジェクトモデル",
}

var relatedDataTypes = []string{
	"shelter",
	"landmark",
	"station",
	"park",
	"railway",
	"emergency_route",
	"border",
}

var relatedDataTypeMap = map[string]string{
	"shelter":         "避難施設情報",
	"landmark":        "ランドマーク情報",
	"station":         "鉄道駅情報",
	"park":            "公園情報",
	"railway":         "鉄道情報",
	"emergency_route": "緊急輸送道路情報",
	"border":          "行政界情報",
}
