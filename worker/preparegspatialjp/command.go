package preparegspatialjp

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"path/filepath"
	"time"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
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
	Clean       bool
}

type MergeContext struct {
	TmpDir          string
	CityItem        *CityItem
	AllFeatureItems map[string]FeatureItem
	UC              int
	WetRun          bool
}

func CommandSingle(conf *Config) (err error) {
	if conf == nil || conf.SkipCityGML && conf.SkipPlateau && conf.SkipMaxLOD && conf.SkipRelated && conf.SkipIndex {
		return fmt.Errorf("no command to run")
	}

	ctx := context.Background()
	cms, err := cms.New(conf.CMSURL, conf.CMSToken)
	if err != nil {
		return fmt.Errorf("failed to initialize CMS client: %w", err)
	}

	// get items fron CMS
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

	indexItemRaw, err := cms.GetItem(ctx, cityItem.GeospatialjpIndex, false)
	if err != nil {
		return fmt.Errorf("failed to get index item: %w", err)
	}

	indexItem := GspatialjpIndexItemFrom(indexItemRaw)
	log.Infofc(ctx, "geospatialjp index item: %s", ppp.Sprint(indexItem))

	gdataItemRaw, err := cms.GetItem(ctx, cityItem.GeospatialjpData, true)
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

	if conf.SkipCityGML && conf.SkipPlateau && conf.SkipMaxLOD && conf.SkipRelated && conf.SkipIndex {
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

	if cityItem.YearInt() == 0 {
		cw.Commentf(ctx, "公開準備処理を開始できません。整備年度が不正です: %s", cityItem.Year)
		return fmt.Errorf("invalid year: %s", cityItem.Year)
	}

	if cityItem.SpecVersionMajorInt() == 0 {
		cw.Commentf(ctx, "公開準備処理を開始できません。仕様書バージョンが不正です: %s", cityItem.Spec)
		return fmt.Errorf("invalid spec version: %s", cityItem.Spec)
	}

	uc := GetUpdateCount(cityItem.CodeLists)
	if uc == 0 {
		cw.Commentf(ctx, "公開準備処理を開始できません。codeListsのzipファイルの命名規則が不正のため版数を読み取れませんでした。もう一度ファイル名の命名規則を確認してください。_1_op_のような文字が必須です。: %s", cityItem.CodeLists)
		return fmt.Errorf("invalid update count: %s", cityItem.CodeLists)
	}

	tmpDirName := fmt.Sprintf("%s-%d", time.Now().Format("20060102-150405"), rand.Intn(1000))
	tmpDir := filepath.Join(tmpDirBase, tmpDirName)
	log.Infofc(ctx, "tmp dir: %s", tmpDir)

	if conf.Clean {
		defer func() {
			log.Infofc(ctx, "cleaning up tmp dir...: %s", tmpDir)
			if err := os.RemoveAll(tmpDir); err != nil {
				log.Warnf("failed to remove tmp dir: %s", err)
			}
		}()
	}

	log.Infofc(ctx, "getting all feature items...")
	allFeatureItems, err := getAllFeatureItems(ctx, cms, cityItem)
	if err != nil {
		cw.NotifyError(ctx, err, !conf.SkipCityGML, !conf.SkipPlateau, !conf.SkipMaxLOD)
		return fmt.Errorf("failed to get all feature items: %w", err)
	}

	log.Infofc(ctx, "feature items: %s", ppp.Sprint(allFeatureItems))

	dic := mergeDics(allFeatureItems)
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

	// related
	if !conf.SkipRelated {
		res, err := PrepareRelated(ctx, cw, mc)
		if err != nil {
			return err
		}

		relatedPath = res
	}

	if relatedPath == "" && !conf.SkipIndex && gdataItem.RelatedURL != "" {
		// download zip
		relatedPath, err = downloadFileTo(ctx, gdataItem.RelatedURL, tmpDir)
		if err != nil {
			return fmt.Errorf("failed to download merged related: %w", err)
		}
	}

	// citygml
	if !conf.SkipCityGML {
		res, err := PrepareCityGML(ctx, cw, mc)
		if err != nil {
			return err
		}

		citygmlPath = res
	}

	if citygmlPath == "" && !conf.SkipIndex && gdataItem.CityGMLURL != "" {
		// download zip
		citygmlPath, err = downloadFileTo(ctx, gdataItem.CityGMLURL, tmpDir)
		if err != nil {
			return fmt.Errorf("failed to download merged citygml: %w", err)
		}
	}

	// plateau
	if !conf.SkipPlateau {
		res, err := PreparePlateau(ctx, cw, mc)
		if err != nil {
			return err
		}

		plateauPath = res
	}

	if plateauPath == "" && !conf.SkipIndex && gdataItem.PlateauURL != "" {
		// download zip
		plateauPath, err = downloadFileTo(ctx, gdataItem.PlateauURL, tmpDir)
		if err != nil {
			return fmt.Errorf("failed to download merged plateau: %w", err)
		}
	}

	if !conf.SkipIndex && citygmlPath != "" && plateauPath != "" {
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
	} else {
		log.Infofc(ctx, "skip index")
	}

	cw.Comment(ctx, "公開準備処理が完了しました。")
	log.Infofc(ctx, "done")
	return
}
