package datacatalogv2adapter

import (
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2/plateauv2"
	cms "github.com/reearth/reearth-cms-api/go"
)

var featureTypes = plateauv2.FeatureTypes

type fetcherPlateauItem struct {
	ID             string `json:"id" cms:"id,text"`
	CityGML        any    `json:"citygml" cms:"citygml,asset"`
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

func (f *fetcherPlateauItem) CityGMLAsset(ft string) []any {
	switch ft {
	case "bldg":
		return f.Bldg
	case "tran":
		return f.Tran
	case "frn":
		return f.Frn
	case "veg":
		return f.Veg
	case "fld":
		return f.Fld
	case "tnm":
		return f.Tnm
	case "htd":
		return f.Htd
	case "ifld":
		return f.Ifld
	case "luse":
		return f.Luse
	case "lsld":
		return f.Lsld
	case "urf":
		return f.Urf
	}
	return nil
}

type fetcherPlateauItem2 struct {
	ID             string
	CityGMLURL     string
	CityGMLAssetID string
	MaxLODURL      string
	FeatureTypes   []string
	SDKPublic      bool
}

func fetcherPlateauItem2From(i *fetcherPlateauItem) *fetcherPlateauItem2 {
	if i.ID == "" || i.CityGML == nil || i.MaxLOD == nil {
		return nil
	}

	citygml := integrationAssetToAsset(i.CityGML)
	if citygml == nil {
		return nil
	}

	fts := make([]string, 0, len(featureTypes))

	for _, ft := range featureTypes {
		a := i.CityGMLAsset(ft)
		if len(a) == 0 {
			continue
		}

		fts = append(fts, ft)
	}

	if i.Dem != "" && i.Dem != "無し" {
		fts = append(fts, "dem")
	}

	return &fetcherPlateauItem2{
		ID:             i.ID,
		CityGMLURL:     citygml.URL,
		CityGMLAssetID: citygml.ID,
		MaxLODURL:      integrationAssetToAsset(i.MaxLOD).URL,
		FeatureTypes:   fts,
		SDKPublic:      i.SDKPublication == "公開する",
	}
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

func cmsItemToFetcherPlateauItem2(i *cms.Item) *fetcherPlateauItem2 {
	if i == nil {
		return nil
	}

	item := &fetcherPlateauItem{}
	i.Unmarshal(item)

	return fetcherPlateauItem2From(item)
}
