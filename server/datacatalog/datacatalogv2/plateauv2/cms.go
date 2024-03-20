package plateauv2

import (
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

var citygmlFeatureTypes = []string{
	"bldg",
	"tran",
	"frn",
	"veg",
	"luse",
	"lsld",
	"urf",
	"fld",
	"tnm",
	"htd",
	"ifld",
	// "gen",
	// "brid",
	// "rail",
}

type CMSItem struct {
	ID               string             `json:"id"`
	Prefecture       string             `json:"prefecture"`
	CityName         string             `json:"city_name"`
	Specification    string             `json:"specification"`
	CityGML          *cms.PublicAsset   `json:"citygml"`
	DescriptionBldg  string             `json:"description_bldg"`
	DescriptionTran  string             `json:"description_tran"`
	DescriptionFrn   string             `json:"description_frn"`
	DescriptionVeg   string             `json:"description_veg"`
	DescriptionLuse  string             `json:"description_luse"`
	DescriptionLsld  string             `json:"description_lsld"`
	DescriptionUrf   []string           `json:"description_urf"`
	DescriptionFld   []string           `json:"description_fld"`
	DescriptionHtd   []string           `json:"description_htd"`
	DescriptionIfld  []string           `json:"description_ifld"`
	DescriptionTnm   []string           `json:"description_tnm"`
	DescriptionBrid  string             `json:"description_brid"`
	DescriptionRail  string             `json:"description_rail"`
	DescriptionGen   []string           `json:"description_gen"`
	DescriptionExtra []string           `json:"description_extra"`
	Bldg             []*cms.PublicAsset `json:"bldg"`
	Tran             []*cms.PublicAsset `json:"tran"`
	Frn              []*cms.PublicAsset `json:"frn"`
	Veg              []*cms.PublicAsset `json:"veg"`
	Luse             []*cms.PublicAsset `json:"luse"`
	Lsld             []*cms.PublicAsset `json:"lsld"`
	Urf              []*cms.PublicAsset `json:"urf"`
	Fld              []*cms.PublicAsset `json:"fld"`
	Htd              []*cms.PublicAsset `json:"htd"`
	Ifld             []*cms.PublicAsset `json:"ifld"`
	Tnm              []*cms.PublicAsset `json:"tnm"`
	Brid             []*cms.PublicAsset `json:"brid"`
	Rail             []*cms.PublicAsset `json:"rail"`
	Gen              []*cms.PublicAsset `json:"gen"`
	Extra            []*cms.PublicAsset `json:"extra"`
	Dictionary       *cms.PublicAsset   `json:"dictionary"`
	Dic              string             `json:"dic"`
	Dem              string             `json:"dem"`
	SearchIndex      []*cms.PublicAsset `json:"search_index"`
	OpenDataURL      string             `json:"opendata_url"`
	MaxLOD           *cms.PublicAsset   `json:"max_lod"`
	SDKPublication   string             `json:"sdk_publication"`
}

func (i CMSItem) IsSDKPublic() bool {
	return i.SDKPublication == "公開する"
}

func (i CMSItem) FeatureTypes() []string {
	res := make([]string, 0, len(citygmlFeatureTypes)+1)
	for _, ft := range citygmlFeatureTypes {
		if len(i.Feature(ft)) > 0 {
			res = append(res, ft)
		}
	}

	if i.Dem != "" && i.Dem != "無し" {
		res = append(res, "dem")
	}

	if len(res) == 0 {
		return nil
	}

	return res
}

func (i CMSItem) Feature(ty string) []*cms.PublicAsset {
	switch ty {
	case "bldg":
		return i.Bldg
	case "tran":
		return i.Tran
	case "frn":
		return i.Frn
	case "veg":
		return i.Veg
	case "luse":
		return i.Luse
	case "lsld":
		return i.Lsld
	case "urf":
		return i.Urf
	case "fld":
		return i.Fld
	case "htd":
		return i.Htd
	case "ifld":
		return i.Ifld
	case "tnm":
		return i.Tnm
	case "brid":
		return i.Brid
	case "rail":
		return i.Rail
	case "gen":
		return i.Gen
	case "extra":
		return i.Extra
	}
	return nil
}

func (i CMSItem) FeatureDescription(ty string) []string {
	switch ty {
	case "bldg":
		return []string{i.DescriptionBldg}
	case "tran":
		return []string{i.DescriptionTran}
	case "frn":
		return []string{i.DescriptionFrn}
	case "veg":
		return []string{i.DescriptionVeg}
	case "luse":
		return []string{i.DescriptionLuse}
	case "lsld":
		return []string{i.DescriptionLsld}
	case "urf":
		return i.DescriptionUrf
	case "fld":
		return i.DescriptionFld
	case "htd":
		return i.DescriptionHtd
	case "ifld":
		return i.DescriptionIfld
	case "tnm":
		return i.DescriptionTnm
	case "brid":
		return []string{i.DescriptionBrid}
	case "rail":
		return []string{i.DescriptionRail}
	case "gen":
		return i.DescriptionGen
	case "extra":
		return i.DescriptionExtra
	}
	return nil
}

func (i CMSItem) AllDataCatalogItems(c PlateauIntermediateItem) []DataCatalogItem {
	if c.ID == "" || c.Year == 0 {
		return nil
	}

	return util.DerefSlice(lo.Filter(
		lo.FlatMap(FeatureTypes, func(ty string, _ int) []*DataCatalogItem {
			return i.DataCatalogItems(c, ty)
		}),
		func(dci *DataCatalogItem, _ int) bool {
			return dci != nil
		},
	))
}

func (i CMSItem) DataCatalogItems(c PlateauIntermediateItem, ty string) []*DataCatalogItem {
	o, ok := FeatureOptions[ty]
	if !ok {
		return nil
	}

	return DataCatalogItemBuilder{
		Assets:           i.Feature(ty),
		Descriptions:     i.FeatureDescription(ty),
		SearchIndex:      i.SearchIndex,
		IntermediateItem: c,
		Options:          o,
	}.Build()
}
