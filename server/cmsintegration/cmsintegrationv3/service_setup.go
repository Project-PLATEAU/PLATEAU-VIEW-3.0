package cmsintegrationv3

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"strings"

	"github.com/eukarya-inc/jpareacode"
	"github.com/reearth/reearthx/log"
	"golang.org/x/exp/slices"
)

type SetupCityItemsInput struct {
	ProjectID string    `json:"projectId"`
	DataURL   string    `json:"dataUrl"`
	DataBody  io.Reader `json:"-"`
	Force     bool      `json:"force"`
	Offset    int       `json:"offset"`
	Limit     int       `json:"limit"`
	DryRun    bool      `json:"dryrun"`
}

type SetupCSVItem struct {
	Prefecture string   `json:"pref"`
	Name       string   `json:"city"`
	NameEn     string   `json:"city_en"`
	Code       string   `json:"city_code"`
	Features   []string `json:"features"`
}

func SetupCityItems(ctx context.Context, s *Services, inp SetupCityItemsInput, onprogress func(i, l int, c SetupCSVItem)) error {
	if inp.ProjectID == "" {
		return fmt.Errorf("modelId is required")
	}

	if inp.DataURL == "" && inp.DataBody == nil {
		return fmt.Errorf("dataUrl is required")
	}

	log.Infofc(ctx, "cmsintegrationv3: setup city items to %s", inp.ProjectID)

	// get model info
	modelIDs := map[string]string{}
	models, err := s.CMS.GetModels(ctx, inp.ProjectID)
	if err != nil {
		return fmt.Errorf("failed to get models: %w", err)
	}
	for _, m := range models.Models {
		if !strings.HasPrefix(m.Key, modelPrefix) {
			continue
		}
		modelIDs[strings.TrimPrefix(m.Key, modelPrefix)] = m.ID
	}
	if len(modelIDs) == 0 || modelIDs[cityModel] == "" || modelIDs[relatedModel] == "" {
		return fmt.Errorf("no models found")
	}

	cityModel := modelIDs[cityModel]
	relatedModel := modelIDs[relatedModel]
	geospatialjpIndexModel := modelIDs[geospatialjpIndex]
	geospatialjpDataModel := modelIDs[geospatialjpData]

	// check city item total count
	if !inp.Force {
		items, err := s.CMS.GetItemsPartially(ctx, cityModel, 0, 1, false)
		if err != nil {
			return fmt.Errorf("failed to get city items: %w", err)
		}
		if items.TotalCount > 0 {
			return fmt.Errorf("city items already exist")
		}
	}

	// parse data
	setupItems, features, err := getAndParseSetupCSV(ctx, s, inp.DataURL, inp.DataBody)
	if err != nil {
		return fmt.Errorf("failed to get and parse data: %w", err)
	}

	if inp.Offset > 0 {
		setupItems = setupItems[inp.Offset+1:]
	}

	if inp.Limit > 0 {
		setupItems = setupItems[:inp.Limit]
	}

	for _, f := range features {
		if modelIDs[f] == "" {
			return fmt.Errorf("model id for %s is not found", f)
		}
	}

	log.Infofc(ctx, "cmsintegrationv3: setup features: %v", features)
	log.Infofc(ctx, "cmsintegrationv3: setup %d items", len(setupItems))

	// process cities
	for i, item := range setupItems {
		if onprogress != nil {
			onprogress(i, len(setupItems), item)
		}

		if inp.DryRun {
			continue
		}

		cityItem := &CityItem{
			Prefecture: item.Prefecture,
			CityName:   item.Name,
			CityNameEn: item.NameEn,
			CityCode:   item.Code,
		}
		cityCMSItem := cityItem.CMSItem()

		newCityItem, err := s.CMS.CreateItem(ctx, cityModel, cityCMSItem.Fields, cityCMSItem.MetadataFields)
		if err != nil {
			return fmt.Errorf("failed to create city item (%d/%d): %w", i, len(setupItems), err)
		}

		relatedItem := &RelatedItem{
			City: newCityItem.ID,
		}

		// related
		newRelatedItem, err := s.CMS.CreateItem(ctx, relatedModel, relatedItem.CMSItem().Fields, nil)
		if err != nil {
			return fmt.Errorf("failed to create related data item (%d/%d): %w", i, len(setupItems), err)
		}

		// geospatialjp-index
		newGeospatialjpIndexItem, err := s.CMS.CreateItem(ctx, geospatialjpIndexModel, (&GeospatialjpIndexItem{
			City: newCityItem.ID,
		}).CMSItem().Fields, nil)
		if err != nil {
			return fmt.Errorf("failed to create geospatialjp-index item (%d/%d): %w", i, len(setupItems), err)
		}

		// geospatialjp-data
		newGeospatialjpDataItem, err := s.CMS.CreateItem(ctx, geospatialjpDataModel, (&GeospatialjpDataItem{
			City: newCityItem.ID,
		}).CMSItem().Fields, nil)
		if err != nil {
			return fmt.Errorf("failed to create geospatialjp-data item (%d/%d): %w", i, len(setupItems), err)
		}

		featureItemIDs := map[string]string{}
		for _, f := range features {
			var status ManagementStatus
			if !slices.Contains(item.Features, f) {
				status = ManagementStatusSkip
			}

			featureItem := &FeatureItem{
				City:   newCityItem.ID,
				Status: tagFrom(status),
			}
			featureCMSItem := featureItem.CMSItem()

			newFeatureItem, err := s.CMS.CreateItem(ctx, modelIDs[f], featureCMSItem.Fields, featureCMSItem.MetadataFields)
			if err != nil {
				return fmt.Errorf("failed to create feature item (%d/%d/%s): %w", i, len(setupItems), f, err)
			}

			featureItemIDs[f] = newFeatureItem.ID
		}

		if _, err := s.CMS.UpdateItem(ctx, newCityItem.ID, (&CityItem{
			References:        featureItemIDs,
			RelatedDataset:    newRelatedItem.ID,
			GeospatialjpIndex: newGeospatialjpIndexItem.ID,
			GeospatialjpData:  newGeospatialjpDataItem.ID,
		}).CMSItem().Fields, nil); err != nil {
			return fmt.Errorf("failed to update city item (%d/%d): %w", i, len(setupItems), err)
		}
	}

	return nil
}

func getAndParseSetupCSV(ctx context.Context, s *Services, url string, body io.Reader) ([]SetupCSVItem, []string, error) {
	if body != nil {
		return parseSetupCSV(body)
	}

	r, err := s.GET(ctx, url)
	if err != nil {
		return nil, nil, err
	}
	defer r.Close()

	return parseSetupCSV(r)
}

func parseSetupCSV(r io.Reader) ([]SetupCSVItem, []string, error) {
	cr := csv.NewReader(r)
	cr.ReuseRecord = true

	// read header
	header, err := cr.Read()
	if err != nil {
		return nil, nil, err
	}

	nameIndex := -1
	nameEnIndex := -1
	prefectureIndex := -1
	codeIndex := -1
	for i, h := range header {
		switch h {
		case "pref":
			prefectureIndex = i
		case "city":
			nameIndex = i
		case "city_en":
			nameEnIndex = i
		case "city_code":
			codeIndex = i
		}
	}
	if nameIndex == -1 || nameEnIndex == -1 || prefectureIndex == -1 {
		return nil, nil, fmt.Errorf("invalid header: %v", header)
	}

	columnFeaturesIndex := max(codeIndex, nameEnIndex, prefectureIndex) + 1
	features := make([]string, 0, len(header)-3)
	for i := columnFeaturesIndex; i < len(header); i++ {
		features = append(features, header[i])
	}

	var items []SetupCSVItem
	i := 0
	for {
		row, err := cr.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, nil, err
		}

		if row[nameIndex] == "" {
			return nil, nil, fmt.Errorf("empty city name at line %d", i)
		}

		if row[prefectureIndex] == "" {
			return nil, nil, fmt.Errorf("empty pref name at line %d", i)
		}

		var code string
		if codeIndex == -1 || row[codeIndex] == "" {
			pref := jpareacode.PrefectureCodeInt(row[prefectureIndex])
			city := jpareacode.CityByName(pref, row[nameIndex], "")
			if city == nil {
				return nil, nil, fmt.Errorf("invalid pref or city name: %s", row[nameIndex])
			}

			code = jpareacode.FormatCityCode(city.Code())
		} else {
			code = row[codeIndex]
		}

		itemFeatures := make([]string, 0, len(row)-3)
		for i := columnFeaturesIndex; i < len(row); i++ {
			if row[i] != "" {
				itemFeatures = append(itemFeatures, features[i-columnFeaturesIndex])
			}
		}

		items = append(items, SetupCSVItem{
			Name:       row[nameIndex],
			NameEn:     row[nameEnIndex],
			Code:       code,
			Prefecture: row[prefectureIndex],
			Features:   itemFeatures,
		})
		i++
	}

	return items, features, nil
}
