package datacatalogv3

import (
	"fmt"
	"sort"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/samber/lo"
)

type internalContext struct {
	regYear           int
	years             map[int]struct{}
	cityItems         map[string]*CityItem
	prefs             map[string]*plateauapi.Prefecture
	cities            map[string]*plateauapi.City
	wards             map[string][]*plateauapi.Ward
	layerNamesForType map[string]LayerNames
	plateauCMSURL     string
	relatedCMSURL     string
	genericCMSURL     string
}

func newInternalContext() *internalContext {
	return &internalContext{
		years:             map[int]struct{}{},
		cityItems:         map[string]*CityItem{},
		prefs:             map[string]*plateauapi.Prefecture{},
		cities:            map[string]*plateauapi.City{},
		wards:             map[string][]*plateauapi.Ward{},
		layerNamesForType: map[string]LayerNames{},
	}
}

func (c *internalContext) CityItem(id string) *CityItem {
	return c.cityItems[id]
}

func (c *internalContext) Wards(cityCode string) []*plateauapi.Ward {
	return c.wards[cityCode]
}

func (c *internalContext) HasPref(prefCode string) bool {
	_, ok := c.prefs[prefCode]
	return ok
}

func (c *internalContext) HasCity(prefCode string) bool {
	_, ok := c.prefs[prefCode]
	return ok
}

func (c *internalContext) Years() []int {
	res := make([]int, 0, len(c.years))
	for y := range c.years {
		res = append(res, y)
	}
	sort.Ints(res)
	return res
}

func (c *internalContext) Add(cityItem *CityItem, pref *plateauapi.Prefecture, city *plateauapi.City) {
	c.cityItems[cityItem.ID] = cityItem
	c.prefs[pref.Code.String()] = pref
	c.cities[city.Code.String()] = city

	if y := cityItem.YearInt(); y != 0 {
		c.years[y] = struct{}{}
	}
}

func (c *internalContext) AddWards(wards []*plateauapi.Ward) {
	for _, w := range wards {
		cityCode := w.CityCode.String()
		c.wards[cityCode] = append(c.wards[cityCode], w)
	}
}

func (c *internalContext) SetURL(t, cmsurl, ws, prj, modelID string) {
	if cmsurl == "" || ws == "" || prj == "" || modelID == "" {
		return
	}

	url := fmt.Sprintf("%s/workspace/%s/project/%s/content/%s/details/", cmsurl, ws, prj, modelID)

	switch t {
	case "plateau":
		c.plateauCMSURL = url
	case "related":
		c.relatedCMSURL = url
	case "generic":
		c.genericCMSURL = url
	}
}

type areaContext struct {
	Pref               *plateauapi.Prefecture
	City               *plateauapi.City
	CityItem           *CityItem
	Wards              []*plateauapi.Ward
	PrefID, CityID     *plateauapi.ID
	PrefCode, CityCode *plateauapi.AreaCode
}

func (c *areaContext) IsValid() bool {
	return c.Pref != nil && c.City != nil && c.CityItem != nil && c.PrefID != nil && c.PrefCode != nil
}

func (c *areaContext) Code() *plateauapi.AreaCode {
	if c.CityCode != nil {
		return c.CityCode
	}
	return c.PrefCode
}

func (c *areaContext) Name() string {
	if c.City != nil {
		return c.City.Name
	}
	if c.Pref != nil {
		return c.Pref.Name
	}
	return ""
}

func (c *internalContext) AreaContext(cityItemID string) *areaContext {
	var prefID, cityID *plateauapi.ID
	var prefCode, cityCode *plateauapi.AreaCode

	cityItem := c.CityItem(cityItemID)
	if cityItem == nil {
		return nil
	}

	city := c.cities[cityItem.CityCode]
	if city != nil && city.Code != plateauapi.AreaCode(city.Code.PrefectureCode()) {
		cityID = lo.ToPtr(city.ID)
		cityCode = lo.ToPtr(city.Code)
	}

	pref := c.prefs[city.Code.PrefectureCode()]
	if pref != nil {
		prefID = lo.ToPtr(pref.ID)
		prefCode = lo.ToPtr(pref.Code)
	}

	return &areaContext{
		CityItem: cityItem,
		City:     city,
		Pref:     pref,
		Wards:    c.Wards(cityItem.CityCode),
		PrefID:   prefID,
		CityID:   cityID,
		PrefCode: prefCode,
		CityCode: cityCode,
	}
}

type LayerNames struct {
	Name        []string
	NamesForLOD map[int][]string
	Prefix      string
}

func (l LayerNames) LayerName(def []string, lod int, format plateauapi.DatasetFormat) []string {
	if !plateauapi.IsLayerSupported(format) {
		return nil
	}

	if l.Name != nil {
		return l.Name
	}

	if l.NamesForLOD != nil {
		if l := l.NamesForLOD[lod]; l != nil {
			return l
		}
	}

	if l.Prefix != "" {
		return lo.Map(def, func(s string, _ int) string {
			return fmt.Sprintf("%s_%s", l.Prefix, s)
		})
	}

	return def
}
