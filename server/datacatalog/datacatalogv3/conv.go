package datacatalogv3

import (
	"fmt"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/samber/lo"
)

func (all *AllData) Into() (res *plateauapi.InMemoryRepoContext, warning []string) {
	res = &plateauapi.InMemoryRepoContext{
		Name:     all.Name,
		Areas:    plateauapi.Areas{},
		Datasets: plateauapi.Datasets{},
	}
	res.PlateauSpecs = plateauapi.PlateauSpecsFrom(all.PlateauSpecs)
	res.DatasetTypes = all.FeatureTypes.ToDatasetTypes(res.PlateauSpecs)

	ic := newInternalContext()
	ic.regYear = all.Year

	// layer names
	ic.layerNamesForType = all.FeatureTypes.LayerNames()

	ic.SetURL("plateau", all.CMSInfo.CMSURL, all.CMSInfo.WorkspaceID, all.CMSInfo.ProjectID, all.CMSInfo.PlateauModelID)
	ic.SetURL("related", all.CMSInfo.CMSURL, all.CMSInfo.WorkspaceID, all.CMSInfo.ProjectID, all.CMSInfo.RelatedModelID)
	ic.SetURL("generic", all.CMSInfo.CMSURL, all.CMSInfo.WorkspaceID, all.CMSInfo.ProjectID, all.CMSInfo.GenericModelID)

	// pref and city
	for _, cityItem := range all.City {
		pref, city := cityItem.ToPrefecture(), cityItem.ToCity()
		if pref == nil || city == nil {
			continue
		}

		ic.Add(cityItem, pref, city)

		if res.Areas.FindByCodeAndType(pref.Code, plateauapi.AreaTypePrefecture) == nil {
			res.Areas.Append(plateauapi.AreaTypePrefecture, []plateauapi.Area{pref})
		}

		if res.Areas.FindByCodeAndType(city.Code, plateauapi.AreaTypeCity) == nil {
			res.Areas.Append(plateauapi.AreaTypeCity, []plateauapi.Area{city})
		}
	}

	res.Years = ic.Years()

	// wards
	for _, ft := range res.DatasetTypes[plateauapi.DatasetTypeCategoryPlateau] {
		wards, w := getWards(all.Plateau[ft.GetCode()], ic)
		warning = append(warning, w...)
		ic.AddWards(wards)
		res.Areas.Append(
			plateauapi.AreaTypeWard,
			lo.Map(wards, func(w *plateauapi.Ward, _ int) plateauapi.Area { return w }),
		)
	}

	// plateau
	plateauDatasetTypes := res.DatasetTypes.CodeMap(plateauapi.DatasetTypeCategoryPlateau)
	plateauFeatureTypes := all.FeatureTypes.PlateauMap()
	for _, dt := range res.DatasetTypes[plateauapi.DatasetTypeCategoryPlateau] {
		datasets, w := convertPlateau(
			all.Plateau[dt.GetCode()],
			dt.GetCode(),
			res.PlateauSpecs,
			plateauDatasetTypes,
			plateauFeatureTypes,
			ic,
		)
		warning = append(warning, w...)
		res.Datasets.Append(plateauapi.DatasetTypeCategoryPlateau, datasets)
	}

	// sample
	sample := res.DatasetTypes.FindByCode("sample", plateauapi.DatasetTypeCategoryGeneric).(*plateauapi.GenericDatasetType)
	if sample != nil {
		datasets, w := convertPlateauRaw(
			all.Sample,
			"",
			res.PlateauSpecs,
			plateauDatasetTypes,
			plateauFeatureTypes,
			ic,
		)
		warning = append(warning, w...)
		res.Datasets.Append(
			plateauapi.DatasetTypeCategoryGeneric,
			plateauapi.ToDatasets(plateauapi.PlateauDatasetsToGenericDatasets(datasets, sample.ID, sample.Code, "sample")),
		)
	}

	// related
	{
		datasets, w := convertRelated(all.Related, res.DatasetTypes[plateauapi.DatasetTypeCategoryRelated], ic)
		warning = append(warning, w...)
		res.Datasets.Append(plateauapi.DatasetTypeCategoryRelated, datasets)
	}

	// generic
	{
		datasets, w := convertGeneric(all.Generic, res.DatasetTypes[plateauapi.DatasetTypeCategoryGeneric], ic)
		warning = append(warning, w...)
		res.Datasets.Append(plateauapi.DatasetTypeCategoryGeneric, datasets)
	}

	// citygml
	{
		var w []string
		res.CityGML, w = toCityGMLs(all, ic.regYear)
		warning = append(warning, w...)
	}

	return
}

func getWards(items []*PlateauFeatureItem, ic *internalContext) (res []*plateauapi.Ward, warning []string) {
	for _, ds := range items {
		area := ic.AreaContext(ds.City)
		if area == nil {
			warning = append(warning, fmt.Sprintf("plateau %s: city not found: %s", ds.ID, ds.City))
			continue
		}

		wards := ds.toWards(area.Pref, area.City)
		res = append(res, wards...)
	}

	return
}

func convertPlateau(items []*PlateauFeatureItem, code string, specs []plateauapi.PlateauSpec, dts map[string]plateauapi.DatasetType, fts map[string]*FeatureType, ic *internalContext) ([]plateauapi.Dataset, []string) {
	res, w := convertPlateauRaw(items, code, specs, dts, fts, ic)
	return plateauapi.ToDatasets(res), w
}

func convertPlateauRaw(items []*PlateauFeatureItem, code string, specs []plateauapi.PlateauSpec, dts map[string]plateauapi.DatasetType, fts map[string]*FeatureType, ic *internalContext) (res []*plateauapi.PlateauDataset, warning []string) {
	for _, ds := range items {
		code := code
		if ds.FeatureType != "" {
			code = ds.FeatureType
		}

		dt := dts[code]
		ft := fts[code]

		if dt == nil || ft == nil {
			warning = append(warning, fmt.Sprintf("plateau %s: invalid feature type: %s", ds.ID, code))
			continue
		}

		pdt, ok := dt.(*plateauapi.PlateauDatasetType)
		if !ok {
			warning = append(warning, fmt.Sprintf("plateau %s: invalid dataset type: %s", dt.GetCode(), dt.GetName()))
			return
		}

		layerNames := ic.layerNamesForType[pdt.Code]
		area := ic.AreaContext(ds.City)
		if area == nil {
			warning = append(warning, fmt.Sprintf("plateau %s %s: invalid city: %s", ds.ID, pdt.Code, ds.City))
			continue
		}

		cityCode := lo.FromPtr(area.CityCode).String()
		spec := plateauapi.FindSpecMinorByName(specs, area.CityItem.Spec)
		if spec == nil {
			warning = append(warning, fmt.Sprintf("plateau %s %s: invalid spec: %s", cityCode, pdt.Code, area.CityItem.Spec))
			continue
		}

		opts := ToPlateauDatasetsOptions{
			CMSURL:      ic.plateauCMSURL,
			Area:        area,
			Spec:        spec,
			DatasetType: pdt,
			LayerNames:  layerNames,
			FeatureType: ft,
			Year:        ic.regYear,
		}
		ds, w := ds.toDatasetsRaw(opts)
		warning = append(warning, w...)
		if ds != nil {
			res = append(res, ds...)
		}
	}

	return
}

func convertRelated(items []*RelatedItem, datasetTypes []plateauapi.DatasetType, ic *internalContext) (res []plateauapi.Dataset, warning []string) {
	for _, ds := range items {
		area := ic.AreaContext(ds.City)
		if area == nil {
			warning = append(warning, fmt.Sprintf("related %s: invalid city: %s", ds.ID, ds.City))
			continue
		}

		ds, w := ds.toDatasets(area, datasetTypes, ic.regYear, ic.relatedCMSURL)
		warning = append(warning, w...)
		if ds != nil {
			res = append(res, ds...)
		}
	}

	return
}

func convertGeneric(items []*GenericItem, datasetTypes []plateauapi.DatasetType, ic *internalContext) (res []plateauapi.Dataset, warning []string) {
	for _, ds := range items {
		area := ic.AreaContext(ds.City)
		if area == nil {
			warning = append(warning, fmt.Sprintf("generic %s: invalid city: %s", ds.ID, ds.City))
			continue
		}

		ds, w := ds.toDatasets(area, datasetTypes, ic.regYear, ic.genericCMSURL)
		warning = append(warning, w...)
		if ds != nil {
			res = append(res, ds...)
		}
	}

	return
}
