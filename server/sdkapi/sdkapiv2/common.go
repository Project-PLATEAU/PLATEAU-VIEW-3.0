package sdkapiv2

import (
	"encoding/csv"
	"fmt"
	"io"
	"net/url"
	"path"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/eukarya-inc/jpareacode"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

const modelKey = "plateau"
const tokyo = "東京都"

type Config struct {
	CMSBaseURL   string
	CMSToken     string
	Project      string
	Model        string
	Token        string
	DisableCache bool
	CacheTTL     int
}

func (c *Config) Default() {
	if c.Model == "" {
		c.Model = modelKey
	}
}

type DatasetResponse struct {
	Data []*DatasetPref `json:"data"`
}

type DatasetPref struct {
	ID    string        `json:"id"`
	Title string        `json:"title"`
	Data  []DatasetCity `json:"data"`
}

type DatasetCity struct {
	ID           string   `json:"id"`
	Spec         string   `json:"spec"`
	CityCode     int      `json:"-"`
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	FeatureTypes []string `json:"featureTypes"`
	Year         int      `json:"-"`
}

type FilesResponse map[string][]File

type File struct {
	Code   string  `json:"code"`
	URL    string  `json:"url"`
	MaxLOD float64 `json:"maxLod"`
}

type Items []Item

func (i Items) DatasetResponse() (r *DatasetResponse) {
	warning := []string{}
	years := map[int]int{}
	r = &DatasetResponse{}
	prefs := []*DatasetPref{}
	prefm := map[string]*DatasetPref{}

	for _, i := range i {
		invalid := false
		if !i.IsPublic() {
			warning = append(warning, fmt.Sprintf("%s:%s:not_published", i.ID, i.CityName))
			invalid = true
		}

		if i.CityGML == nil || i.CityGML.ID == "" {
			warning = append(warning, fmt.Sprintf("%s:%s:no_citygml", i.ID, i.CityName))
			invalid = true
		}

		if i.CityGML != nil && !i.CityGML.IsExtractionDone() {
			warning = append(warning, fmt.Sprintf("%s:%s:invalid_citygml", i.ID, i.CityName))
			invalid = true
		}

		if i.MaxLOD == nil || i.MaxLOD.URL == "" {
			warning = append(warning, fmt.Sprintf("%s:%s:no_maxlod", i.ID, i.CityName))
			invalid = true
		}

		if i.Dem == "" {
			warning = append(warning, fmt.Sprintf("%s:%s:no_dem_info", i.ID, i.CityName))
		}

		citycode, year := i.CityCode(), i.Year()

		if year > 0 && citycode > 0 {
			if yy, ok := years[citycode]; ok && yy >= year {
				// it's old data
				invalid = true
			} else {
				years[citycode] = year
			}
		} else {
			warning = append(warning, fmt.Sprintf("%s:invalid_year_or_citycode", i.CityName))
		}

		ft := i.FeatureTypes()
		if len(ft) == 0 {
			warning = append(warning, fmt.Sprintf("%s:no_features", i.CityName))
			invalid = true
		}

		if invalid {
			continue
		}

		if _, ok := prefm[i.Prefecture]; !ok {
			pd := &DatasetPref{
				ID:    i.Prefecture,
				Title: i.Prefecture,
			}
			prefs = append(prefs, pd)
			prefm[i.Prefecture] = prefs[len(prefs)-1]
		}

		d := DatasetCity{
			ID:           i.ID,
			Spec:         i.SpecVersion(),
			CityCode:     citycode,
			Title:        i.CityName,
			Description:  i.Description,
			FeatureTypes: ft,
			Year:         year,
		}
		pd := prefm[i.Prefecture]
		pd.Data = append(pd.Data, d)
	}

	// filter
	prefs = lo.FilterMap(prefs, func(d *DatasetPref, _ int) (*DatasetPref, bool) {
		d.Data = lo.Filter(d.Data, func(c DatasetCity, _ int) bool {
			y := years[c.CityCode]
			return y > 0 && c.Year > 0 && c.Year == y
		})
		return d, len(d.Data) > 0
	})

	// sort
	sort.Slice(prefs, func(a, b int) bool {
		at, bt := prefs[a].Title, prefs[b].Title
		ac, bc := 0, 0
		if at != tokyo {
			ac = jpareacode.PrefectureCodeInt(at)
		}
		if bt != tokyo {
			bc = jpareacode.PrefectureCodeInt(bt)
		}
		return ac < bc
	})

	for _, p := range prefs {
		sort.Slice(p.Data, func(a, b int) bool {
			return p.Data[a].CityCode < p.Data[b].CityCode
		})
	}

	r.Data = prefs

	if len(warning) > 0 {
		log.Warnf("sdk: dataset warn: %s", strings.Join(warning, ", "))
	}

	return
}

type Item struct {
	ID             string            `json:"id"`
	Specification  string            `json:"specification"`
	Prefecture     string            `json:"prefecture"`
	CityName       string            `json:"city_name"`
	CityGML        *cms.PublicAsset  `json:"citygml"`
	Description    string            `json:"description_bldg"`
	MaxLOD         *cms.PublicAsset  `json:"max_lod"`
	Bldg           []cms.PublicAsset `json:"bldg"`
	Tran           []cms.PublicAsset `json:"tran"`
	Frn            []cms.PublicAsset `json:"frn"`
	Veg            []cms.PublicAsset `json:"veg"`
	Luse           []cms.PublicAsset `json:"luse"`
	Lsld           []cms.PublicAsset `json:"lsld"`
	Urf            []cms.PublicAsset `json:"urf"`
	Fld            []cms.PublicAsset `json:"fld"`
	Tnm            []cms.PublicAsset `json:"tnm"`
	Htd            []cms.PublicAsset `json:"htd"`
	Ifld           []cms.PublicAsset `json:"ifld"`
	Dem            string            `json:"dem"`
	SDKPublication string            `json:"sdk_publication"`
}

func (i Item) IsPublic() bool {
	return i.SDKPublication == "公開する"
}

func (i Item) SpecVersion() string {
	return strings.TrimSuffix(strings.TrimPrefix(i.Specification, "第"), "版")
}

func (i Item) CityCode() int {
	return cityCode(i.CityGML)
}

var reYear = regexp.MustCompile(`^\d+?_.+?_(\d+?)_`)

func (i Item) Year() int {
	if i.CityGML == nil {
		return 0
	}

	u, _ := url.Parse(i.CityGML.URL)
	if u == nil || u.Path == "" {
		return 0
	}

	m := reYear.FindStringSubmatch(path.Base(u.Path))
	if len(m) != 2 {
		return 0
	}

	y, _ := strconv.Atoi(m[1])
	return y
}

func (i Item) FeatureTypes() (t []string) {
	if len(i.Bldg) > 0 {
		t = append(t, "bldg")
	}
	if len(i.Tran) > 0 {
		t = append(t, "tran")
	}
	if len(i.Frn) > 0 {
		t = append(t, "frn")
	}
	if len(i.Veg) > 0 {
		t = append(t, "veg")
	}
	if len(i.Luse) > 0 {
		t = append(t, "luse")
	}
	if len(i.Lsld) > 0 {
		t = append(t, "lsld")
	}
	if len(i.Urf) > 0 {
		t = append(t, "urf")
	}
	if len(i.Fld) > 0 {
		t = append(t, "fld")
	}
	if len(i.Tnm) > 0 {
		t = append(t, "tnm")
	}
	if len(i.Htd) > 0 {
		t = append(t, "htd")
	}
	if len(i.Ifld) > 0 {
		t = append(t, "ifld")
	}
	if i.Dem != "" && i.Dem != "無し" {
		t = append(t, "dem")
	}
	return
}

type MaxLODColumns []MaxLODColumn

type MaxLODColumn struct {
	Code   string  `json:"code"`
	Type   string  `json:"type"`
	MaxLOD float64 `json:"maxLod"`
	File   string  `json:"file"`
}

type MaxLODMap map[string]map[string]MaxLODMapItem

type MaxLODMapItem struct {
	MaxLOD float64
	Files  []string
}

func (mc MaxLODColumns) Map() MaxLODMap {
	m := MaxLODMap{}

	for _, c := range mc {
		if _, ok := m[c.Type]; !ok {
			m[c.Type] = map[string]MaxLODMapItem{}
		}
		t := m[c.Type]
		if _, ok := t[c.Code]; !ok {
			t[c.Code] = MaxLODMapItem{
				MaxLOD: c.MaxLOD,
				Files:  []string{c.File},
			}
		} else {
			t[c.Code] = MaxLODMapItem{
				MaxLOD: c.MaxLOD,
				Files:  append(t[c.Code].Files, c.File),
			}
		}
	}

	return m
}

func (mm MaxLODMap) Files(urls []*url.URL) (r FilesResponse, warning []string) {
	r = FilesResponse{}
	for ty, m := range mm {
		if _, ok := r[ty]; !ok {
			r[ty] = ([]File)(nil)
		}

		for code, item := range m {
			prefix := fmt.Sprintf("%s_%s_", code, ty)

			for _, f := range item.Files {
				u, ok := lo.Find(urls, func(u *url.URL) bool {
					if f != "" {
						return strings.HasSuffix(u.Path, f)
					}
					return strings.HasPrefix(path.Base(u.Path), prefix) && path.Ext(u.Path) == ".gml" // prefix_xxx.gml
				})
				if ok {
					r[ty] = append(r[ty], File{
						Code:   code,
						URL:    u.String(),
						MaxLOD: item.MaxLOD,
					})
				} else {
					warning = append(warning, fmt.Sprintf("unmatched:type=%s,code=%s,path=%s", ty, code, f))
				}
			}
		}
		slices.SortFunc(r[ty], func(i, j File) int {
			return strings.Compare(i.Code, j.Code)
		})
	}
	return
}

type IItem struct {
	ID             string `json:"id" cms:"id,text"`
	Specification  string `json:"specification" cms:"specification,select"`
	Prefecture     string `json:"prefecture" cms:"prefecture,text"`
	CityName       string `json:"city_name" cms:"city_name,text"`
	CityGML        any    `json:"citygml" cms:"citygml,asset"`
	Description    string `json:"description_bldg" cms:"description_bldg,textarea"`
	MaxLOD         any    `json:"max_lod" cms:"max_lod,asset"`
	Bldg           []any  `json:"bldg" cms:"bldg,asset"`
	Tran           []any  `json:"tran" cms:"tran,asset"`
	Frn            []any  `json:"frn" cms:"frn,asset"`
	Veg            []any  `json:"veg" cms:"veg,asset"`
	Fld            []any  `json:"fld" cms:"fld,asset"`
	Tnm            []any  `json:"tnm" cms:"tnm,asset"`
	Htd            []any  `json:"htd" cms:"htd,asset"`
	Ifld           []any  `json:"ifld" cms:"ifld,asset"`
	Luse           []any  `json:"luse" cms:"luse,asset"`
	Lsld           []any  `json:"lsld" cms:"lsld,asset"`
	Urf            []any  `json:"urf" cms:"veg,asset"`
	Dem            string `json:"dem" cms:"dem,select"`
	SDKPublication string `json:"sdk_publication" cms:"sdk_publication,select"`
}

func (i IItem) Item() Item {
	return Item{
		ID:             i.ID,
		Specification:  i.Specification,
		Prefecture:     i.Prefecture,
		CityName:       i.CityName,
		CityGML:        integrationAssetToAsset(i.CityGML).ToPublic(),
		Description:    i.Description,
		MaxLOD:         integrationAssetToAsset(i.MaxLOD).ToPublic(),
		Bldg:           assetsToPublic(integrationAssetToAssets(i.Bldg)),
		Tran:           assetsToPublic(integrationAssetToAssets(i.Tran)),
		Frn:            assetsToPublic(integrationAssetToAssets(i.Frn)),
		Veg:            assetsToPublic(integrationAssetToAssets(i.Veg)),
		Fld:            assetsToPublic(integrationAssetToAssets(i.Fld)),
		Tnm:            assetsToPublic(integrationAssetToAssets(i.Tnm)),
		Htd:            assetsToPublic(integrationAssetToAssets(i.Htd)),
		Ifld:           assetsToPublic(integrationAssetToAssets(i.Ifld)),
		Luse:           assetsToPublic(integrationAssetToAssets(i.Luse)),
		Lsld:           assetsToPublic(integrationAssetToAssets(i.Lsld)),
		Urf:            assetsToPublic(integrationAssetToAssets(i.Urf)),
		Dem:            i.Dem,
		SDKPublication: i.SDKPublication,
	}
}

func cityCode(a *cms.PublicAsset) int {
	if a == nil || a.URL == "" {
		return 0
	}

	u, err := url.Parse(a.URL)
	if err != nil {
		return 0
	}

	code, _, ok := strings.Cut(path.Base(u.Path), "_")
	if !ok {
		return 0
	}

	c, _ := strconv.Atoi(code)
	return c
}

func ItemsFromIntegration(items []cms.Item) Items {
	return lo.FilterMap(items, func(i cms.Item, _ int) (Item, bool) {
		item := ItemFromIntegration(&i)
		return item, item.IsPublic()
	})
}

func ItemFromIntegration(ci *cms.Item) Item {
	i := IItem{}
	ci.Unmarshal(&i)
	return i.Item()
}

func assetsToPublic(a []cms.Asset) []cms.PublicAsset {
	if len(a) == 0 {
		return nil
	}
	return lo.FilterMap(a, func(a cms.Asset, _ int) (cms.PublicAsset, bool) {
		p := a.ToPublic()
		if p == nil {
			return cms.PublicAsset{}, false
		}
		return *p, true
	})
}

func integrationAssetToAssets(a []any) []cms.Asset {
	return lo.FilterMap(a, func(a any, _ int) (cms.Asset, bool) {
		pa := integrationAssetToAsset(a)
		if pa == nil {
			return cms.Asset{}, false
		}
		return *pa, true
	})
}

func integrationAssetToAsset(a any) *cms.Asset {
	if a == nil {
		return nil
	}

	p := cms.PublicAssetFrom(a)
	if p == nil {
		return nil
	}

	return &p.Asset
}

func ReadMaxLODCSV(b io.Reader) (MaxLODColumns, error) {
	r := csv.NewReader(b)
	r.ReuseRecord = true
	var results MaxLODColumns
	for {
		c, err := r.Read()
		if err == io.EOF {
			break
		}

		if err != nil {
			return nil, fmt.Errorf("failed to read csv: %w", err)
		}

		if len(c) < 3 || !isInt(c[0]) {
			continue
		}

		m, err := strconv.ParseFloat(c[2], 64)
		if err != nil {
			continue
		}

		f := ""
		if len(c) > 3 {
			f = c[3]
		}

		results = append(results, MaxLODColumn{
			Code:   c[0],
			Type:   c[1],
			MaxLOD: m,
			File:   f,
		})
	}

	return results, nil
}

func MaxLODFiles(maxLOD MaxLODColumns, assetPaths []string, assetBase *url.URL) (FilesResponse, []string) {
	files := lo.FilterMap(assetPaths, func(u string, _ int) (*url.URL, bool) {
		if path.Ext(u) != ".gml" {
			return nil, false
		}

		u2, err := url.Parse(u)
		if err != nil {
			return nil, false
		}

		if assetBase == nil {
			return u2, true
		}

		fu := util.CloneRef(assetBase)
		fu.Path = path.Join(fu.Path, u)
		return fu, true
	})

	return maxLOD.Map().Files(files)
}
