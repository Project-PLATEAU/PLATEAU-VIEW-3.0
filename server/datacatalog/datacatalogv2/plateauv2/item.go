package plateauv2

import (
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2/datacatalogutil"
)

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
	// force not creating a type folder
	Root bool `json:"root,omitempty"`
	// force creating a type folder on root
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
}
