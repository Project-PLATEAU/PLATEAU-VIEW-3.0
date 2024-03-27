package datacatalogv2

import (
	"encoding/json"
	"strings"

	"github.com/eukarya-inc/jpareacode"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2/datacatalogutil"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

const folder = "フォルダ"
const folderEn = "folder"

type UsecaseItem struct {
	ID          string           `json:"id,omitempty"`
	Name        string           `json:"name,omitempty"`
	Prefecture  string           `json:"prefecture,omitempty"`
	CityName    string           `json:"city_name,omitempty"`
	WardName    string           `json:"ward_name,omitempty"`
	OpenDataURL string           `json:"opendata_url,omitempty"`
	Description string           `json:"description,omitempty"`
	Year        string           `json:"year,omitempty"`
	Data        *cms.PublicAsset `json:"data,omitempty"`
	DataFormat  string           `json:"data_format,omitempty"`
	DataURL     string           `json:"data_url,omitempty"`
	DataLayers  string           `json:"data_layer,omitempty"`
	Config      string           `json:"config,omitempty"`
	Order       *int             `json:"order,omitempty"`
	Category    string           `json:"category,omitempty"`
	Type        string           `json:"type,omitempty"`
	TypeEn      string           `json:"type_en,omitempty"`
	Infobox     bool             `json:"infobox,omitempty"`
}

func (i UsecaseItem) GetCityName() string {
	return i.CityName
}

func (i UsecaseItem) DataCatalogs() []DataCatalogItem {
	pref, prefCodeInt := normalizePref(i.Prefecture)
	prefCode := jpareacode.FormatPrefectureCode(prefCodeInt)

	var city, ward string
	if i.WardName != "" {
		city = i.CityName
		ward = i.WardName
	} else {
		city, ward, _ = strings.Cut(i.CityName, "/")
	}

	cCode := datacatalogutil.CityCode("", city, "", prefCodeInt)
	var wCode string
	if ward != "" {
		wCode = datacatalogutil.CityCode("", city, ward, prefCodeInt)
	}

	if i.DataFormat == folder {
		return []DataCatalogItem{{
			ID:          i.ID,
			Name:        i.Name,
			Type:        folder,
			TypeEn:      folderEn,
			Pref:        pref,
			PrefCode:    prefCode,
			Description: i.Description,
			Family:      "generic",
			Edition:     "2022",
			//
			CityAdmin:     city,
			CityCodeAdmin: cCode,
			WardAdmin:     ward,
			WardCodeAdmin: wCode,
		}}
	}

	var c *datacatalogutil.DataCatalogItemConfig
	_ = json.Unmarshal([]byte(i.Config), &c)

	u := ""
	if i.Data != nil && i.Data.URL != "" {
		u = i.Data.URL
	}
	if u == "" {
		u = i.DataURL
	}

	f := formatTypeEn(i.DataFormat)

	var layers []string
	if i.DataLayers != "" {
		layers = lo.Filter(util.Map(strings.Split(i.DataLayers, ","), strings.TrimSpace), func(s string, _ int) bool { return s != "" })
	}

	ty, tyen := i.Type, i.TypeEn
	if ty != "" && tyen == "" {
		tyen = ty
	}
	if ty == "" || ty == "ユースケース" || tyen == "usecase" {
		ty = "ユースケース"
		tyen = "usecase"
	}

	cat := i.Category
	if cat == "" && ty != "ユースケース" {
		cat = "ユースケース"
	}

	return []DataCatalogItem{{
		ID:          i.ID,
		Name:        i.Name,
		Type:        ty,
		TypeEn:      tyen,
		Pref:        pref,
		PrefCode:    prefCode,
		Format:      f,
		URL:         datacatalogutil.AssetURLFromFormat(u, f),
		Description: i.Description,
		Config:      c,
		Layers:      layers,
		Year:        yearInt(i.Year),
		OpenDataURL: i.OpenDataURL,
		Order:       i.Order,
		RootType:    pref != zenkyu,
		Category:    cat,
		Infobox:     i.Infobox,
		Family:      "generic",
		Edition:     "2022",
		//
		CityAdmin:     city,
		CityCodeAdmin: cCode,
		WardAdmin:     ward,
		WardCodeAdmin: wCode,
	}}
}
