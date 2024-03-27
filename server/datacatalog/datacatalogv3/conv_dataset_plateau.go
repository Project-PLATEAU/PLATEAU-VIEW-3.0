package datacatalogv3

import (
	"fmt"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/samber/lo"
)

const dicKeyAdmin = "admin"

func (i *PlateauFeatureItem) toWards(pref *plateauapi.Prefecture, city *plateauapi.City) (res []*plateauapi.Ward) {
	dic, _ := i.ReadDic()
	if dic == nil || len(dic[dicKeyAdmin]) == 0 {
		return nil
	}

	entries := dic[dicKeyAdmin]
	for _, entry := range entries {
		if entry.Code.String() == "" || entry.Description == "" {
			continue
		}

		_, name, _ := strings.Cut(entry.Description, " ")
		if name == "" {
			name = entry.Description
		}

		ward := &plateauapi.Ward{
			ID:             plateauapi.NewID(entry.Code.String(), plateauapi.TypeWard),
			Name:           name,
			Type:           plateauapi.AreaTypeWard,
			Code:           plateauapi.AreaCode(entry.Code.String()),
			PrefectureID:   pref.ID,
			PrefectureCode: pref.Code,
			CityID:         city.ID,
			CityCode:       city.Code,
		}

		res = append(res, ward)
	}

	return
}

type ToPlateauDatasetsOptions struct {
	CMSURL      string
	Area        *areaContext
	Spec        *plateauapi.PlateauSpecMinor
	DatasetType *plateauapi.PlateauDatasetType
	LayerNames  LayerNames
	FeatureType *FeatureType
	Year        int
}

func (i *PlateauFeatureItem) toDatasets(opts ToPlateauDatasetsOptions) ([]plateauapi.Dataset, []string) {
	res, w := i.toDatasetsRaw(opts)
	return plateauapi.ToDatasets(res), w
}

func (i *PlateauFeatureItem) toDatasetsRaw(opts ToPlateauDatasetsOptions) (res []*plateauapi.PlateauDataset, warning []string) {
	if !opts.Area.IsValid() {
		warning = append(warning, fmt.Sprintf("plateau %s: invalid area", i.ID))
		return
	}

	if opts.DatasetType == nil {
		warning = append(warning, fmt.Sprintf("plateau %s: invalid dataset type", i.ID))
		return
	}

	if opts.FeatureType == nil {
		warning = append(warning, fmt.Sprintf("plateau %s: invalid feature type: %s", i.ID, opts.DatasetType.GetCode()))
		return
	}

	if opts.Spec == nil {
		warning = append(warning, fmt.Sprintf("plateau %s: invalid spec", i.ID))
		return
	}

	datasetSeeds, w := plateauDatasetSeedsFrom(i, opts)
	warning = append(warning, w...)
	for _, seed := range datasetSeeds {
		dataset, w := seedToDataset(seed)
		warning = append(warning, w...)
		if dataset != nil {
			res = append(res, dataset)
		}
	}

	return
}

func seedToDataset(seed plateauDatasetSeed) (res *plateauapi.PlateauDataset, warning []string) {
	if len(seed.AssetURLs) == 0 {
		// warning = append(warning, fmt.Sprintf("plateau %s %s: no asset urls", seed.TargetArea.GetCode(), seed.DatasetType.Code))
		return
	}

	sid := seed.GetID()
	id := plateauapi.NewID(sid, plateauapi.TypeDataset)

	seeds, w := plateauDatasetItemSeedFrom(seed)
	warning = append(warning, w...)
	items := lo.FilterMap(seeds, func(s plateauDatasetItemSeed, i int) (*plateauapi.PlateauDatasetItem, bool) {
		item := seedToDatasetItem(s, sid)
		if item == nil {
			warning = append(warning, fmt.Sprintf("plateau %s %s[%d]: unknown dataset format: %s", seed.TargetArea.GetCode(), seed.DatasetType.Code, i, s.URL))
		}
		return item, item != nil
	})

	if len(items) == 0 {
		// warning is already reported by plateauDatasetItemSeedFrom
		warning = append(warning, fmt.Sprintf("plateau %s %s: no items", seed.TargetArea.GetCode(), seed.DatasetType.Code))
		return
	}

	res = &plateauapi.PlateauDataset{
		ID:                 id,
		Name:               standardItemName(seed.DatasetType.Name, seed.Subname, seed.TargetArea.GetName()),
		Subname:            lo.EmptyableToPtr(seed.Subname),
		Subcode:            lo.EmptyableToPtr(seed.Subcode),
		Suborder:           seed.Suborder,
		Description:        lo.EmptyableToPtr(seed.Desc),
		Year:               seed.Area.CityItem.YearInt(),
		RegisterationYear:  seed.RegisterationYear,
		OpenDataURL:        lo.EmptyableToPtr(seed.OpenDataURL),
		PrefectureID:       seed.Area.PrefID,
		PrefectureCode:     seed.Area.PrefCode,
		CityID:             seed.Area.CityID,
		CityCode:           seed.Area.CityCode,
		WardID:             seed.WardID,
		WardCode:           seed.WardCode,
		TypeID:             seed.DatasetType.ID,
		TypeCode:           seed.DatasetType.Code,
		PlateauSpecMinorID: seed.Spec.ID,
		River:              seed.River,
		Admin:              seed.Admin,
		Groups:             seed.Groups,
		Items:              items,
	}

	return
}

func seedToDatasetItem(i plateauDatasetItemSeed, parentID string) *plateauapi.PlateauDatasetItem {
	return &plateauapi.PlateauDatasetItem{
		ID:                  plateauapi.NewID(i.GetID(parentID), plateauapi.TypeDatasetItem),
		Name:                i.GetName(),
		URL:                 i.URL,
		Layers:              i.Layers,
		Format:              i.Format,
		Lod:                 i.LOD,
		Texture:             textureFrom(i.NoTexture),
		ParentID:            plateauapi.NewID(parentID, plateauapi.TypeDataset),
		FloodingScale:       i.FloodingScale,
		FloodingScaleSuffix: i.FloodingScaleSuffix,
	}
}
