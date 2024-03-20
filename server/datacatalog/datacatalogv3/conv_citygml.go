package datacatalogv3

import (
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
	for _, data := range all.Plateau {
		for _, d := range data {
			if !d.Sample || d.MaxLOD == "" || d.CityGML == "" {
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

			maxlod := citygml.Admin.(map[string]any)["maxlod"].([]string)
			citygmlURL := citygml.Admin.(map[string]any)["citygmlUrl"].([]string)

			maxlod = append(maxlod, d.MaxLOD)
			citygmlURL = append(citygmlURL, d.CityGML)

			citygml.Admin.(map[string]any)["maxlod"] = maxlod
			citygml.Admin.(map[string]any)["citygmlUrl"] = citygmlURL
		}
	}

	return res, nil
}
