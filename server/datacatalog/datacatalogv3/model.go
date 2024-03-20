package datacatalogv3

import "github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"

type AllData struct {
	Name                  string
	Year                  int
	PlateauSpecs          []plateauapi.PlateauSpecSimple
	FeatureTypes          FeatureTypes
	City                  []*CityItem
	Related               []*RelatedItem
	Generic               []*GenericItem
	Plateau               map[string][]*PlateauFeatureItem
	GeospatialjpDataItems []*GeospatialjpDataItem
	CMSInfo               CMSInfo
}

func (d *AllData) FindPlateauFeatureItemByCityID(ft, cityID string) *PlateauFeatureItem {
	for _, f := range d.Plateau[ft] {
		if f != nil && f.City == cityID {
			return f
		}
	}
	return nil
}

func (all *AllData) FeatureTypesOf(cityID string) (res []string) {
	for _, ft := range all.FeatureTypes.Plateau {
		if p := all.FindPlateauFeatureItemByCityID(ft.Code, cityID); p != nil && p.CityGML != "" {
			res = append(res, ft.Code)
		}
	}

	return res
}

type FeatureTypes struct {
	Plateau []FeatureType
	Related []FeatureType
	Generic []FeatureType
}

func (ft FeatureTypes) FindPlateauByCode(code string) *FeatureType {
	for _, f := range ft.Plateau {
		if f.Code == code {
			return &f
		}
	}
	return nil
}

type CMSInfo struct {
	CMSURL         string
	WorkspaceID    string
	ProjectID      string
	PlateauModelID string
	RelatedModelID string
	GenericModelID string
}
