package geospatialjpv3

import (
	"context"
	"fmt"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/ckan"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

func (s *handler) createOrUpdatePackage(ctx context.Context, seed PackageSeed) (*ckan.Package, bool, error) {
	// find
	pkg, pkgName, err := s.findPackage(ctx, seed.Name)
	if err != nil {
		return nil, false, fmt.Errorf("G空間情報センターからデータセットを検索できませんでした: %w", err)
	}

	// create
	if pkg == nil {
		newpkg := seed.ToNewPackage()
		log.Infofc(ctx, "geospartialjp: package %s not found so new package will be created", pkgName)
		log.Debugfc(ctx, "geospartialjp: package create: %s", ppp.Sprint(newpkg))

		pkg2, err := s.ckan.CreatePackage(ctx, newpkg)
		if err != nil {
			return nil, false, fmt.Errorf("G空間情報センターにデータセット %s を作成できませんでした: %w", pkgName, err)
		}
		return &pkg2, true, nil
	}

	// update
	newpkg := seed.ToPackage()
	newpkg.ID = pkg.ID
	log.Debugfc(ctx, "geospartialjp: package update: %s", ppp.Sprint(newpkg))

	pkg2, err := s.ckan.PatchPackage(ctx, newpkg)
	if err != nil {
		return nil, false, fmt.Errorf("G空間情報センターにデータセット %s を更新できませんでした: %w", pkgName, err)
	}
	return &pkg2, false, nil
}

func (s *handler) findPackage(ctx context.Context, pkgname PackageName) (_ *ckan.Package, n string, err error) {
	// pattern1 -shi
	name := pkgname.String()
	p, _ := s.ckan.ShowPackage(ctx, name)
	if p.Name != "" {
		return &p, p.Name, nil
	}

	// pattern2 -city
	name2 := strings.Replace(name, "-shi", "-city", 1)
	if name != name2 {
		p, _ = s.ckan.ShowPackage(ctx, name2)
		if p.Name != "" {
			return &p, p.Name, nil
		}
	}

	return nil, name, nil
}

type ResourceInfo struct {
	Name        string
	URL         string
	Description string
}

func (resInfo ResourceInfo) Into(pkgID, resID string) ckan.Resource {
	return ckan.Resource{
		ID:          resID,
		PackageID:   pkgID,
		Name:        resInfo.Name,
		URL:         resInfo.URL,
		Description: resInfo.Description,
	}
}

func (s *handler) createOrUpdateResource(ctx context.Context, pkg *ckan.Package, resInfo ResourceInfo) (ckan.Resource, error) {
	// find
	res1 := findResource(pkg, resInfo.Name)
	if res1 != nil {
		res, err := s.ckan.PatchResource(ctx, resInfo.Into(pkg.ID, res1.ID))
		if err != nil {
			return res, fmt.Errorf("G空間情報センターのリソース %s を更新できませんでした: %w", resInfo.Name, err)
		}

		log.Infofc(ctx, "geospartialjpv3: resource %s updated", resInfo.Name)
		return res, nil
	}

	res2, err := s.ckan.CreateResource(ctx, resInfo.Into(pkg.ID, ""))
	if err != nil {
		return res2, fmt.Errorf("G空間情報センターにリソース %s を作成できませんでした: %w", resInfo.Name, err)
	}

	log.Infofc(ctx, "geospartialjpv3: resource %s created", resInfo.Name)
	return res2, nil
}

func findResource(pkg *ckan.Package, resourceName string) *ckan.Resource {
	res, ok := lo.Find(pkg.Resources, func(r ckan.Resource) bool {
		return r.Name == resourceName
	})
	if !ok {
		return nil
	}
	return &res
}

func datasetName(cityCode, cityName string, year int) string {
	datasetName := ""
	if isTokyo23ku(cityName) {
		if year <= 2020 {
			datasetName = fmt.Sprintf("plateau-%s", gspatialjpTokyo23ku)
		} else {
			datasetName = fmt.Sprintf("plateau-%s-%d", gspatialjpTokyo23ku, year)
		}
	} else {
		datasetName = fmt.Sprintf("plateau-%s-%s-%d", cityCode, cityName, year)
	}
	return datasetName
}

func isTokyo23ku(cityName string) bool {
	return cityName == citygmlTokyo23ku || cityName == citygmlTokyo23ku2 || cityName == gspatialjpTokyo23ku
}

var (
	gspatialjpTokyo23ku = "tokyo23ku"
	citygmlTokyo23ku    = "tokyo23-ku"
	citygmlTokyo23ku2   = "tokyo-23ku"
)

func (s *handler) reorderResources(ctx context.Context, pkg string, order []string) error {
	if len(order) == 0 {
		return nil
	}

	err := s.ckan.ReorderResource(ctx, pkg, order)
	if err != nil {
		return fmt.Errorf("G空間情報センターにリソースの順序を変更できませんでした: %w", err)
	}

	return nil
}
