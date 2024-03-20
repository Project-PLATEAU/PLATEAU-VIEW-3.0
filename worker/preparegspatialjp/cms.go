package preparegspatialjp

import (
	"regexp"
	"strconv"
	"strings"

	cms "github.com/reearth/reearth-cms-api/go"
)

var featureTypes = []string{
	"bldg", // 建築物モデル
	"tran", // 交通（道路）モデル
	"rwy",  // 交通（鉄道）モデル
	"trk",  // 交通（徒歩道）モデル
	"squr", // 交通（広場）モデル
	"wwy",  // 交通（航路）モデル
	"luse", // 土地利用モデル
	"fld",  // 洪水浸水想定区域モデル
	"tnm",  // 津波浸水想定区域モデル
	"htd",  // 高潮浸水想定区域モデル
	"ifld", // 内水浸水想定区域モデル
	"lsld", // 土砂災害モデル
	"urf",  // 都市計画決定情報モデル
	"unf",  // 地下埋設物モデル
	"brid", // 橋梁モデル
	"tun",  // トンネルモデル
	"cons", // その他の構造物モデル
	"frn",  // 都市設備モデル
	"ubld", // 地下街モデル
	"veg",  // 植生モデル
	"dem",  // 地形モデル
	"wtr",  // 水部モデル
	"area", // 区域モデル
	"gen",  // 汎用都市オブジェクトモデル
}

var citygmlFiles = []string{
	"codelists",
	"schemas",
	"metadata",
	"specification",
	"misc",
}

type CityItem struct {
	ID                string            `json:"id,omitempty" cms:"id"`
	Prefecture        string            `json:"prefecture,omitempty" cms:"prefecture,select"`
	CityName          string            `json:"city_name,omitempty" cms:"city_name,text"`
	CityNameEn        string            `json:"city_name_en,omitempty" cms:"city_name_en,text"`
	CityCode          string            `json:"city_code,omitempty" cms:"city_code,text"`
	CodeLists         string            `json:"codelists,omitempty" cms:"codelists,asset"`
	Schemas           string            `json:"schemas,omitempty" cms:"schemas,asset"`
	Metadata          string            `json:"metadata,omitempty" cms:"metadata,asset"`
	Specification     string            `json:"specification,omitempty" cms:"specification,asset"`
	Spec              string            `json:"spec,omitempty" cms:"spec,select"`
	Misc              string            `json:"misc,omitempty" cms:"misc,asset"`
	Year              string            `json:"year,omitempty" cms:"year,select"`
	RelatedDataset    string            `json:"related,omitempty" cms:"related,reference"`
	References        map[string]string `json:"references,omitempty" cms:"-"`
	GeospatialjpIndex string            `json:"geospatialjp-index,omitempty" cms:"geospatialjp-index,reference"`
	GeospatialjpData  string            `json:"geospatialjp-data,omitempty" cms:"geospatialjp-data,reference"`
}

func CityItemFrom(item *cms.Item) (i *CityItem) {
	i = &CityItem{}
	item.Unmarshal(i)

	references := map[string]string{}
	for _, ft := range featureTypes {
		if ref := item.FieldByKey(ft).GetValue().String(); ref != nil {
			references[ft] = *ref
		}
	}

	if u := item.FieldByKey("codelists").GetValue().AssetURL(); u != "" {
		i.CodeLists = u
	}
	if u := item.FieldByKey("schemas").GetValue().AssetURL(); u != "" {
		i.Schemas = u
	}
	if u := item.FieldByKey("metadata").GetValue().AssetURL(); u != "" {
		i.Metadata = u
	}
	if u := item.FieldByKey("specification").GetValue().AssetURL(); u != "" {
		i.Specification = u
	}
	if u := item.FieldByKey("misc").GetValue().AssetURL(); u != "" {
		i.Misc = u
	}

	if i.Year == "" {
		i.Year = "2023年度"
	}

	i.References = references
	return
}

func (c *CityItem) YearInt() int {
	return YearInt(c.Year)
}

func (c *CityItem) SpecVersionMajorInt() int {
	v := SpecVersion(c.Spec)
	first, _, _ := strings.Cut(v, ".")
	if i, err := strconv.Atoi(first); err == nil {
		return i
	}
	return 0
}

type GspatialjpDataItem struct {
	ID                 string   `json:"id,omitempty" cms:"id"`
	CityGML            string   `json:"citygml,omitempty" cms:"citygml,asset"`
	Plateau            string   `json:"plateau,omitempty" cms:"plateau,asset"`
	Related            string   `json:"related,omitempty" cms:"related,asset"`
	Generic            []string `json:"generic,omitempty" cms:"generic,asset"`
	MaxLOD             string   `json:"maxlod,omitempty" cms:"maxlod,asset"`
	Index              string   `json:"desc_index,omitempty" cms:"desc_index,markdown"`
	MergeCityGMLStatus *cms.Tag `json:"merge_citygml_status" cms:"merge_citygml_status,tag,metadata"`
	MergePlateauStatus *cms.Tag `json:"merge_plateau_status" cms:"merge_plateau_status,tag,metadata"`
	MergeRelatedStatus *cms.Tag `json:"merge_related_status" cms:"merge_related_status,tag,metadata"`
	MergeMaxLODStatus  *cms.Tag `json:"merge_maxlod_status" cms:"merge_maxlod_status,tag,metadata"`
}

const idle = "未実行"
const running = "実行中"
const failed = "エラー"
const sucess = "成功"

var idleTag = &cms.Tag{Name: idle}
var runningTag = &cms.Tag{Name: running}
var failedTag = &cms.Tag{Name: failed}
var successTag = &cms.Tag{Name: sucess}

func (g *GspatialjpDataItem) ShouldMergeCityGML() bool {
	return g.MergeCityGMLStatus == nil || g.MergeCityGMLStatus.Name != running
}

func (g *GspatialjpDataItem) ShouldMergePlateau() bool {
	return g.MergeCityGMLStatus == nil || g.MergePlateauStatus.Name != running
}

func (g *GspatialjpDataItem) ShouldMergeRelated() bool {
	return g.MergeCityGMLStatus == nil || g.MergeRelatedStatus.Name != running
}

func (g *GspatialjpDataItem) ShouldMergeMaxLOD() bool {
	return g.MergeCityGMLStatus == nil || g.MergeMaxLODStatus.Name != running
}

func GspatialjpDataItemFrom(item *cms.Item) (i *GspatialjpDataItem) {
	i = &GspatialjpDataItem{}
	item.Unmarshal(i)
	return
}

type GspatialjpIndexItem struct {
	ID      string                     `json:"id,omitempty" cms:"id"`
	Generic []GspatialjpIndexItemGroup `json:"generic,omitempty" cms:"generic,group"`
}

func (g *GspatialjpIndexItem) GenericMap() map[string]string {
	m := map[string]string{}
	for _, g := range g.Generic {
		if u := g.AssetURL(); u != "" {
			m[g.Name] = u
		}
	}
	return m
}

func GspatialjpIndexItemFrom(item *cms.Item) (i *GspatialjpIndexItem) {
	i = &GspatialjpIndexItem{}
	item.Unmarshal(i)
	return
}

type GspatialjpIndexItemGroup struct {
	Name  string         `cms:"name,text"`
	Type  string         `cms:"type,select"`
	Asset map[string]any `cms:"asset,asset"`
}

func (g *GspatialjpIndexItemGroup) AssetURL() string {
	if g == nil || g.Asset == nil {
		return ""
	}
	if url, ok := g.Asset["url"].(string); ok {
		return url
	}
	return ""
}

var reReiwa = regexp.MustCompile(`令和([0-9]+?)年度?`)

func YearInt(y string) (year int) {
	if ym := reReiwa.FindStringSubmatch(y); len(ym) > 1 {
		yy, _ := strconv.Atoi(ym[1])
		if yy > 0 {
			year = yy + 2018
		}
	} else if yy, err := strconv.Atoi(strings.TrimSuffix(strings.TrimSuffix(y, "度"), "年")); err == nil {
		year = yy
	}
	return year
}

func SpecVersion(version string) string {
	return strings.TrimSuffix(strings.TrimPrefix(version, "第"), "版")
}

var reUpdateCount = regexp.MustCompile(`_(\d+)_op_`)

func GetUpdateCount(u string) int {
	if m := reUpdateCount.FindStringSubmatch(u); len(m) > 1 {
		if i, err := strconv.Atoi(m[1]); err == nil {
			return i
		}
	}
	return 0
}
