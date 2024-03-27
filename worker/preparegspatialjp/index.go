package preparegspatialjp

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/reearth/reearthx/log"
)

type IndexSeed struct {
	CityName       string
	CityCode       string
	Year           int
	V              int
	CityGMLZipPath string
	PlateuaZipPath string
	RelatedZipPath string
	Generic        []GspatialjpIndexItemGroup
	Dic            map[string]map[string]string
}

type IndexItem struct {
	Name     string
	Children []*IndexItem
}

func PrepareIndex(ctx context.Context, cw *CMSWrapper, seed *IndexSeed) (err error) {
	defer func() {
		if err == nil {
			return
		}
		err = fmt.Errorf("目録の生成に失敗しました: %w", err)
		cw.Comment(ctx, err.Error())
	}()

	index, err := GenerateIndex(ctx, seed)
	if err != nil {
		return fmt.Errorf("目録の生成に失敗しました: %w", err)
	}

	log.Infofc(ctx, "index generated: %s", index)

	if err := cw.UpdateDataItem(ctx, &GspatialjpDataItem{
		Index: index,
	}); err != nil {
		return fmt.Errorf("failed to update data item: %w", err)
	}

	return nil
}

func GenerateIndex(ctx context.Context, seed *IndexSeed) (string, error) {
	citygmlFS, citygmlSize, citygmlFSCloser, err := openZip(seed.CityGMLZipPath)
	if err != nil {
		return "", fmt.Errorf("failed to open citygml zip: %w", err)
	}

	plateauFS, plateauSize, plateauFSCloser, err := openZip(seed.PlateuaZipPath)
	if err != nil {
		return "", fmt.Errorf("failed to open plateau zip: %w", err)
	}

	relatedFS, relatedSize, relatedFSCloser, err := openZip(seed.RelatedZipPath)
	if err != nil {
		return "", fmt.Errorf("failed to open related zip: %w", err)
	}

	defer func() {
		if citygmlFSCloser != nil {
			_ = citygmlFSCloser()
		}
		if plateauFSCloser != nil {
			_ = plateauFSCloser()
		}
		if relatedFSCloser != nil {
			_ = relatedFSCloser()
		}
	}()

	citygmlName := filepath.Base(seed.CityGMLZipPath)
	citygml, err := generateCityGMLIndexItem(seed, citygmlName, citygmlSize, citygmlFS)
	if err != nil {
		return "", fmt.Errorf("failed to generate citygml index items: %w", err)
	}

	plateauName := filepath.Base(seed.PlateuaZipPath)
	plateau, err := generatePlateauIndexItem(seed, plateauName, plateauSize, plateauFS)
	if err != nil {
		return "", fmt.Errorf("failed to generate plateau index items: %w", err)
	}

	relatedName := filepath.Base(seed.RelatedZipPath)
	related, err := generateRelatedIndexItem(seed, relatedName, relatedSize, relatedFS)
	if err != nil {
		return "", fmt.Errorf("failed to generate related index items: %w", err)
	}

	generics, err := generateGenericdIndexItems(seed.Generic)
	if err != nil {
		return "", fmt.Errorf("failed to generate generic index items: %w", err)
	}

	items := append([]*IndexItem{citygml, plateau, related}, generics...)

	leading := fmt.Sprintf("%sの%d年度版データを標準製品仕様書V%dに基づいて作成した提供データ目録です。\n\n", seed.CityName, seed.Year, seed.V)
	return leading + renderIndexItems(items, 0), nil
}

func renderIndexItems(t []*IndexItem, depth int) (res string) {
	for _, c := range t {
		res += renderIndexItem(c, depth)
	}
	return
}

func renderIndexItem(t *IndexItem, depth int) (res string) {
	if t == nil {
		return ""
	}
	res = fmt.Sprintf("%s- %s\n", strings.Repeat("  ", depth*2), t.Name)
	for _, c := range t.Children {
		res += renderIndexItem(c, depth+1)
	}
	return
}
