package datacatalogv2

import (
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2/datacatalogutil"
	"github.com/samber/lo"
)

type ItemCommon interface {
	GetCityName() string
	DataCatalogs() []DataCatalogItem
}

type DataCatalogItem struct {
	ID             string                                 `json:"id,omitempty"`
	ItemID         string                                 `json:"itemId,omitempty"`
	Name           string                                 `json:"name,omitempty"`
	Pref           string                                 `json:"pref,omitempty"`
	PrefCode       string                                 `json:"pref_code,omitempty"`
	City           string                                 `json:"city,omitempty"`
	CityEn         string                                 `json:"city_en,omitempty"`
	CityCode       string                                 `json:"city_code,omitempty"`
	Ward           string                                 `json:"ward,omitempty"`
	WardEn         string                                 `json:"ward_en,omitempty"`
	WardCode       string                                 `json:"ward_code,omitempty"`
	Type           string                                 `json:"type,omitempty"`
	Type2          string                                 `json:"type2,omitempty"`
	TypeEn         string                                 `json:"type_en,omitempty"`
	Type2En        string                                 `json:"type2_en,omitempty"`
	Format         string                                 `json:"format,omitempty"`
	Layers         []string                               `json:"layers,omitempty"`
	URL            string                                 `json:"url,omitempty"`
	Description    string                                 `json:"desc,omitempty"`
	SearchIndex    string                                 `json:"search_index,omitempty"`
	Year           int                                    `json:"year,omitempty"`
	PRCS           cmsintegrationcommon.PRCS              `json:"prcs,omitempty"`
	OpenDataURL    string                                 `json:"openDataUrl,omitempty"`
	Config         *datacatalogutil.DataCatalogItemConfig `json:"config,omitempty"`
	Order          *int                                   `json:"order,omitempty"`
	OriginalURL    string                                 `json:"original_url,omitempty"`
	OriginalFormat string                                 `json:"original_format,omitempty"`
	// force not creatign a type folder
	Root bool `json:"root,omitempty"`
	// force creating folder on root
	RootType bool   `json:"root_type,omitempty"`
	Group    string `json:"group,omitempty"`
	Infobox  bool   `json:"infobox,omitempty"`
	// alias of type that is used as a folder name
	Category string `json:"category,omitempty"`
	// internal
	Spec                string   `json:"-"`
	Family              string   `json:"-"`
	Edition             string   `json:"-"`
	CityGMLURL          string   `json:"-"`
	CityGMLAssetID      string   `json:"-"`
	CityGMLFeatureTypes []string `json:"-"`
	MaxLODURL           string   `json:"-"`
	SDKPublic           bool     `json:"-"`
	CityAdmin           string   `json:"-"`
	CityEnAdmin         string   `json:"-"`
	CityCodeAdmin       string   `json:"-"`
	WardAdmin           string   `json:"-"`
	WardEnAdmin         string   `json:"-"`
	WardCodeAdmin       string   `json:"-"`
}

func (i DataCatalogItem) MainConfigItem() *datacatalogutil.DataCatalogItemConfigItem {
	if i.URL == "" {
		return nil
	}

	name := i.Type2
	if name == "" {
		name = i.Type
	}
	return &datacatalogutil.DataCatalogItemConfigItem{
		Name:           name,
		URL:            i.URL,
		Type:           i.Format,
		Layers:         i.Layers,
		OriginalURL:    i.OriginalURL,
		OriginalFormat: i.OriginalFormat,
	}
}

func (i DataCatalogItem) ConfigItems() []datacatalogutil.DataCatalogItemConfigItem {
	if i.Config == nil {
		return nil
	}
	return i.Config.Data
}

func (i DataCatalogItem) MainOrConfigItems() []datacatalogutil.DataCatalogItemConfigItem {
	configItems := i.ConfigItems()
	if len(configItems) == 0 {
		if main := i.MainConfigItem(); main != nil {
			return []datacatalogutil.DataCatalogItemConfigItem{*main}
		}
	}
	return configItems
}

type DataCatalogGroup struct {
	ID         string `json:"id,omitempty"`
	Name       string `json:"name,omitempty"`
	Prefecture string `json:"pref,omitempty"`
	City       string `json:"city,omitempty"`
	CityEn     string `json:"cityEn,omitempty"`
	Type       string `json:"type,omitempty"`
	Children   []any  `json:"children"`
}

type ResponseAll struct {
	Plateau []PlateauItem
	Dataset []DatasetItem
	Usecase []UsecaseItem
}

func (d ResponseAll) All() []DataCatalogItem {
	return append(append(d.PlateauItems(), d.DatasetItems()...), d.UsecaseItems()...)
}

func (d ResponseAll) PlateauItems() []DataCatalogItem {
	return items(d.Plateau, true)
}

func (d ResponseAll) DatasetItems() []DataCatalogItem {
	return items(d.Dataset, false)
}

func (d ResponseAll) UsecaseItems() []DataCatalogItem {
	return items(d.Usecase, false)
}

func items[T ItemCommon](data []T, omitOldItems bool) []DataCatalogItem {
	items := lo.FlatMap(data, func(i T, _ int) []DataCatalogItem {
		return i.DataCatalogs()
	})

	if !omitOldItems {
		return items
	}

	m := map[string]int{}
	for _, i := range items {
		m[i.CityCode] = i.Year
	}
	return lo.Filter(items, func(i DataCatalogItem, _ int) bool {
		y, ok := m[i.CityCode]
		return ok && y == i.Year
	})
}
