package datacatalogv3

import (
	"slices"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
)

func toCityGMLs(all *AllData, regYear int) (map[plateauapi.ID]*plateauapi.CityGMLDataset, []string) {
	cmsurl := all.CMSInfo.CMSURL
	res := map[plateauapi.ID]*plateauapi.CityGMLDataset{}
	resCity := map[string]*plateauapi.CityGMLDataset{}
	dataMap := make(map[string]*GeospatialjpDataItem)
	cityMap := make(map[string]*CityItem)

	for _, d := range all.GeospatialjpDataItems {
		if d.CityGML == "" || d.MaxLOD == "" {
			continue
		}
		dataMap[d.City] = d
	}

	for _, city := range all.City {
		data := dataMap[city.ID]
		if data == nil {
			continue
		}

		prefCode := plateauapi.AreaCode(city.CityCode).PrefectureCode()
		adminExtra := map[string]any{
			"maxlod":     []string{data.MaxLOD},
			"citygmlUrl": []string{data.CityGML},
		}

		d := &plateauapi.CityGMLDataset{
			ID:                 plateauapi.CityGMLDatasetIDFrom(plateauapi.AreaCode(city.CityCode)),
			URL:                data.CityGML,
			Year:               city.YearInt(),
			RegistrationYear:   regYear,
			PrefectureCode:     plateauapi.AreaCode(prefCode),
			PrefectureID:       plateauapi.NewID(prefCode, plateauapi.TypePrefecture),
			CityID:             plateauapi.NewID(city.CityCode, plateauapi.TypeCity),
			CityCode:           plateauapi.AreaCode(city.CityCode),
			FeatureTypes:       all.FeatureTypesOf(city.ID),
			PlateauSpecMinorID: plateauapi.PlateauSpecIDFrom(city.Spec),
			Admin:              newAdmin(city.ID, city.SDKStage(), cmsurl, adminExtra),
		}

		cityMap[city.ID] = city
		res[d.ID] = d
		resCity[data.City] = d
	}

	// add citygml urls for sample data
	for ft, data := range all.Plateau {
		for _, d := range data {
			if !d.Sample || d.MaxLOD == "" || d.CityGML == "" /*|| !d.IsBeta()*/ {
				continue
			}

			citygml := resCity[d.City]
			if citygml == nil {
				continue
			}

			city := cityMap[d.City]
			if city == nil || !city.SDKPublic {
				continue
			}

			addCityGML(d.CityGML, d.MaxLOD, ft, citygml)
		}
	}

	for _, d := range all.Sample {
		if d.MaxLOD == "" || d.CityGML == "" {
			continue
		}

		citygml := resCity[d.City]
		if citygml == nil {
			continue
		}

		city := cityMap[d.City]
		if city == nil || !city.SDKPublic {
			continue
		}

		addCityGML(d.CityGML, d.MaxLOD, d.FeatureType, citygml)
	}

	return res, nil
}

func addCityGML(citygmlURL, maxlodURL, featureType string, citygml *plateauapi.CityGMLDataset) {
	if citygmlURL == "" || maxlodURL == "" {
		return
	}

	baseCitygmlURL := citygml.Admin.(map[string]any)["citygmlUrl"].([]string)
	baseMaxlod := citygml.Admin.(map[string]any)["maxlod"].([]string)

	baseCitygmlURL = append(baseCitygmlURL, citygmlURL)
	baseMaxlod = append(baseMaxlod, maxlodURL)

	citygml.Admin.(map[string]any)["citygmlUrl"] = baseCitygmlURL
	citygml.Admin.(map[string]any)["maxlod"] = baseMaxlod

	if featureType != "" && !slices.Contains(citygml.FeatureTypes, featureType) {
		citygml.FeatureTypes = append(citygml.FeatureTypes, featureType)
	}
}
