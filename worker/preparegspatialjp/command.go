package preparegspatialjp

import (
	"context"
	"fmt"
	"math/rand"
	"path/filepath"
	"time"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

const tmpDirBase = "plateau-api-worker-tmp"

type Config struct {
	CMSURL      string
	CMSToken    string
	ProjectID   string
	CityItemID  string
	SkipCityGML bool
	SkipPlateau bool
	SkipMaxLOD  bool
	SkipIndex   bool
	SkipRelated bool
	WetRun      bool
}

type MergeContext struct {
	TmpDir          string
	CityItem        *CityItem
	AllFeatureItems map[string]FeatureItem
	UC              int
	WetRun          bool
}

func Command(conf *Config) (err error) {
	if conf == nil || conf.SkipCityGML && conf.SkipPlateau && conf.SkipMaxLOD && conf.SkipRelated {
		return fmt.Errorf("no command to run")
	}

	ctx := context.Background()
	cms, err := cms.New(conf.CMSURL, conf.CMSToken)
	if err != nil {
		return fmt.Errorf("failed to initialize CMS client: %w", err)
	}

	// get items fron CNS
	log.Infofc(ctx, "getting item from CMS...")

	cityItemRaw, err := cms.GetItem(ctx, conf.CityItemID, true)
	if err != nil {
		return fmt.Errorf("failed to get city item: %w", err)
	}
	log.Infofc(ctx, "city item raw: %s", ppp.Sprint(cityItemRaw))

	cityItem := CityItemFrom(cityItemRaw)
	log.Infofc(ctx, "city item: %s", ppp.Sprint(cityItem))

	if cityItem == nil || cityItem.CityCode == "" || cityItem.CityName == "" || cityItem.CityNameEn == "" || cityItem.GeospatialjpData == "" {
		return fmt.Errorf("invalid city item: %s", conf.CityItemID)
	}

	if cityItem.YearInt() == 0 {
		return fmt.Errorf("invalid year: %s", cityItem.Year)
	}

	if cityItem.SpecVersionMajorInt() == 0 {
		return fmt.Errorf("invalid spec version: %s", cityItem.Spec)
	}

	uc := GetUpdateCount(cityItem.CodeLists)
	if uc == 0 {
		return fmt.Errorf("invalid update count: %s", cityItem.CodeLists)
	}

	indexItemRaw, err := cms.GetItem(ctx, cityItem.GeospatialjpIndex, false)
	if err != nil {
		return fmt.Errorf("failed to get index item: %w", err)
	}

	indexItem := GspatialjpIndexItemFrom(indexItemRaw)
	log.Infofc(ctx, "geospatialjp index item: %s", ppp.Sprint(indexItem))

	gdataItemRaw, err := cms.GetItem(ctx, cityItem.GeospatialjpData, false)
	if err != nil {
		return fmt.Errorf("failed to get geospatialjp data item: %w", err)
	}

	gdataItem := GspatialjpDataItemFrom(gdataItemRaw)
	log.Infofc(ctx, "geospatialjp data item: %s", ppp.Sprint(gdataItem))

	if gdataItem != nil {
		if !gdataItem.ShouldMergeCityGML() {
			conf.SkipCityGML = true
		}
		if !gdataItem.ShouldMergePlateau() {
			conf.SkipPlateau = true
		}
		if !gdataItem.ShouldMergeMaxLOD() {
			conf.SkipMaxLOD = true
		}
	}

	if conf.SkipCityGML && conf.SkipPlateau && conf.SkipMaxLOD && conf.SkipRelated {
		return fmt.Errorf("no command to run")
	}

	cw := &CMSWrapper{
		CMS:         cms,
		ProjectID:   conf.ProjectID,
		DataItemID:  cityItem.GeospatialjpData,
		CityItemID:  conf.CityItemID,
		SkipCityGML: conf.SkipCityGML,
		SkipPlateau: conf.SkipPlateau,
		SkipMaxLOD:  conf.SkipMaxLOD,
		SkipIndex:   conf.SkipIndex,
		WetRun:      conf.WetRun,
	}

	tmpDirName := fmt.Sprintf("%s-%d", time.Now().Format("20060102-150405"), rand.Intn(1000))
	tmpDir := filepath.Join(tmpDirBase, tmpDirName)
	log.Infofc(ctx, "tmp dir: %s", tmpDir)

	log.Infofc(ctx, "getting all feature items...")
	allFeatureItems, err := getAllFeatureItems(ctx, cms, cityItem)
	if err != nil {
		cw.NotifyError(ctx, err, !conf.SkipCityGML, !conf.SkipPlateau, !conf.SkipMaxLOD)
		return fmt.Errorf("failed to get all feature items: %w", err)
	}

	log.Infofc(ctx, "feature items: %s", ppp.Sprint(allFeatureItems))

	dic := mergeDics(lo.MapToSlice(allFeatureItems, func(k string, v FeatureItem) string {
		return v.Dic
	})...)
	log.Infofc(ctx, "dic: %s", ppp.Sprint(dic))

	mc := MergeContext{
		TmpDir:          tmpDir,
		CityItem:        cityItem,
		AllFeatureItems: allFeatureItems,
		UC:              uc,
		WetRun:          conf.WetRun,
	}

	cw.NotifyRunning(ctx)

	// prepare
	if !conf.SkipMaxLOD {
		if err := PrepareMaxLOD(ctx, cw, mc); err != nil {
			return err
		}
	}

	var citygmlPath, plateauPath, relatedPath string

	if !conf.SkipRelated {
		res, err := PrepareRelated(ctx, cw, mc)
		if err != nil {
			return err
		}

		relatedPath = res
	}

	if !conf.SkipCityGML {
		res, err := PrepareCityGML(ctx, cw, mc)
		if err != nil {
			return err
		}

		citygmlPath = res
	}

	if !conf.SkipPlateau {
		res, err := PreparePlateau(ctx, cw, mc)
		if err != nil {
			return err
		}

		plateauPath = res
	}

	if !conf.SkipIndex && citygmlPath != "" && plateauPath != "" && relatedPath != "" {
		if err := PrepareIndex(ctx, cw, &IndexSeed{
			CityName:       cityItem.CityName,
			CityCode:       cityItem.CityCode,
			Year:           cityItem.YearInt(),
			V:              cityItem.SpecVersionMajorInt(),
			CityGMLZipPath: citygmlPath,
			PlateuaZipPath: plateauPath,
			RelatedZipPath: relatedPath,
			Generic:        indexItem.Generic,
			Dic:            dic,
		}); err != nil {
			return err
		}
	}

	log.Infofc(ctx, "done")
	return
}
