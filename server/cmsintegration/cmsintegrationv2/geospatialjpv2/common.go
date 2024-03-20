package geospatialjpv2

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/ckan"
	"github.com/pkg/errors"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/xuri/excelize/v2"
)

type Config struct {
	CkanBase                  string
	CkanOrg                   string
	CkanToken                 string
	CkanPrivate               bool
	CMSBase                   string
	CMSToken                  string
	CMSIntegration            string
	DisablePublication        bool
	DisableCatalogCheck       bool
	EnablePulicationOnWebhook bool
	PublicationToken          string
}

type Services struct {
	CMS         cms.Interface
	Ckan        ckan.Interface
	CkanOrg     string
	CkanPrivate bool
}

func NewServices(conf Config) (*Services, error) {
	cms, err := cms.New(conf.CMSBase, conf.CMSToken)
	if err != nil {
		return nil, fmt.Errorf("failed to init cms: %w", err)
	}

	ckan, err := ckan.New(conf.CkanBase, conf.CkanToken)
	if err != nil {
		return nil, fmt.Errorf("failed to init ckan: %w", err)
	}

	return &Services{
		CMS:         cms,
		Ckan:        ckan,
		CkanOrg:     conf.CkanOrg,
		CkanPrivate: conf.CkanPrivate,
	}, nil
}

func (s *Services) CheckCatalog(ctx context.Context, projectID string, i Item) error {
	// get catalog url
	catalogAsset, err := s.CMS.Asset(ctx, i.Catalog)
	if err != nil {
		if _, err := s.CMS.UpdateItem(ctx, i.ID, Item{
			CatalogStatus: StatusError,
		}.Fields(), nil); err != nil {
			log.Errorfc(ctx, "failed to update item %s: %w", i.ID, err)
		}
		return fmt.Errorf("目録アセットの読み込みに失敗しました。該当アセットが削除されていませんか？: %w", err)
	}

	// parse catalog
	c, _, err := s.parseCatalog(ctx, catalogAsset.URL)
	if err != nil {
		if _, err := s.CMS.UpdateItem(ctx, i.ID, Item{
			CatalogStatus: StatusError,
		}.Fields(), nil); err != nil {
			log.Errorfc(ctx, "failed to update item %s: %w", i.ID, err)
		}
		return err
	}

	if c != nil {
		c2 := *c
		c2.Thumbnail = nil
		log.Infofc(ctx, "geospatialjp: catalog: %+v", c2)
	}

	if c == nil {
		if _, err := s.CMS.UpdateItem(ctx, i.ID, Item{
			CatalogStatus: StatusError,
		}.Fields(), nil); err != nil {
			log.Errorfc(ctx, "failed to update item %s: %w", i.ID, err)
		}
		return fmt.Errorf("G空間情報センター用メタデータシートが見つかりません。")
	}

	// validate catalog
	if err := c.Validate(); err != nil {
		if _, err := s.CMS.UpdateItem(ctx, i.ID, Item{
			CatalogStatus: StatusError,
		}.Fields(), nil); err != nil {
			log.Errorfc(ctx, "failed to update item %s: %w", i.ID, err)
		}
		return err
	}

	// update item
	if _, err := s.CMS.UpdateItem(ctx, i.ID, Item{
		CatalogStatus: StatusOK,
	}.Fields(), nil); err != nil {
		return fmt.Errorf("failed to update item %s: %w", i.ID, err)
	}

	return nil
}

func (s *Services) RegisterCkanResources(ctx context.Context, i Item, disableSDKPublication bool) error {
	if i.Catalog == "" {
		return errors.New("「目録ファイル」が登録されていません。")
	}

	// decide year and suffix
	specVersion := i.SpecVersion()
	if specVersion <= 0 {
		return errors.New("仕様書のバージョンを読み取ることができませんでした。")
	}
	suffix := suffixFromSpec(specVersion)

	// get citygml asset
	cityGMLAssetID := i.CityGMLGeoSpatialJP
	if cityGMLAssetID == "" {
		cityGMLAssetID = i.CityGML
	}
	if cityGMLAssetID == "" {
		return errors.New("「CityGML」が登録されていません。")
	}

	citygmlAsset, err := s.CMS.Asset(ctx, cityGMLAssetID)
	if err != nil {
		return fmt.Errorf("CityGMLアセットの読み込みに失敗しました。該当アセットが削除されていませんか？: %w", err)
	}

	cityCode, cityName, dataYear, err := extractCityName(citygmlAsset.URL)
	if err != nil {
		return fmt.Errorf("CityGMLのzipファイル名から市区町村コードまたは市区町村英名を読み取ることができませんでした。ファイル名の形式が正しいか確認してください。: %w", err)
	}

	log.Infofc(ctx, "geospatialjp: citygml: code=%s name=%s year=%d suffix=%s", cityCode, cityName, dataYear, suffix)

	// get all url
	var allAsset *cms.Asset
	if i.All != "" {
		allAsset, err = s.CMS.Asset(ctx, i.All)
		if err != nil {
			return fmt.Errorf("全データアセットの読み込みに失敗しました。該当アセットが削除されていませんか？: %w", err)
		}
	}

	// get catalog url
	catalogAsset, err := s.CMS.Asset(ctx, i.Catalog)
	if err != nil {
		return fmt.Errorf("目録アセットの読み込みに失敗しました。該当アセットが削除されていませんか？: %w", err)
	}
	catalogAssetURL, err := url.Parse(catalogAsset.URL)
	if err != nil {
		return fmt.Errorf("目録アセットのURLが不正です: %w", err)
	}
	catalogFileName := path.Base(catalogAssetURL.Path)

	// parse catalog
	c, cbuf, err := s.parseCatalogAndDeleteSheet(ctx, catalogAsset.URL)
	if err != nil {
		return err
	}

	if c != nil {
		c2 := *c
		c2.Thumbnail = nil
		log.Infofc(ctx, "geospatialjp: catalog: %+v", c2)
	}

	// find or create package
	pkg, err := s.findOrCreatePackage(ctx, c, cityCode, cityName, dataYear)
	if err != nil {
		return err
	}

	if pkg != nil {
		pkg2 := *pkg
		pkg2.ThumbnailURL = fmt.Sprintf("<len:%d>", len(pkg.ThumbnailURL))
		log.Infofc(ctx, "geospatialjp: find or create package: %+v", pkg2)
	}

	// save catalog resource
	if cbuf != nil && catalogFileName != "" {
		catalogResource, _ := findResource(pkg, ResourceNameCatalog+suffix, "XLSX", "", "")
		if _, err = s.Ckan.UploadResource(ctx, catalogResource, catalogFileName, cbuf); err != nil {
			return fmt.Errorf("G空間情報センターへの目録リソースの登録に失敗しました。: %w", err)
		}
	} else {
		log.Infofc(ctx, "geospatialjp: catalog is not registerd so uploading is skipped")
	}

	// save citygml resoruce
	citygmlResource, needUpdate := findResource(pkg, ResourceNameCityGML+suffix, "ZIP", "", citygmlAsset.URL)
	if needUpdate {
		if _, err = s.Ckan.SaveResource(ctx, citygmlResource); err != nil {
			return fmt.Errorf("G空間情報センターへのCityGMLリソースの登録に失敗しました。: %w", err)
		}
	} else {
		log.Infofc(ctx, "geospatialjp: updating citygml resource was skipped")
	}

	// save all resource
	if allAsset != nil {
		allResource, needUpdate := findResource(pkg, ResourceNameAll+suffix, "ZIP", "", allAsset.URL)
		if needUpdate {
			if _, err = s.Ckan.SaveResource(ctx, allResource); err != nil {
				return fmt.Errorf("G空間情報センターへの全データリソースの登録に失敗しました。: %w", err)
			}
		} else {
			log.Infofc(ctx, "geospatialjp: updating all resource was skipped")
		}
	} else {
		log.Infofc(ctx, "geospatialjp: all is not registerd so uploading is skipped")
	}

	sdkpub := ""
	if !disableSDKPublication {
		sdkpub = "公開する"
	}

	// update item
	if i.ID != "" {
		if _, err := s.CMS.UpdateItem(ctx, i.ID, Item{
			ID:             i.ID,
			SDKPublication: sdkpub,
			CatalogStatus:  StatusOK,
		}.Fields(), nil); err != nil {
			log.Errorfc(ctx, "geospatialjp: failed to update an item: %v", err)
		}
	}

	return nil
}

func (s *Services) parseCatalogAndDeleteSheet(ctx context.Context, catalogURL string) (c *Catalog, b []byte, err2 error) {
	c, cf, err := s.parseCatalog(ctx, catalogURL)
	if err != nil {
		err2 = err
		return
	}

	// validate catalog
	if c != nil {
		if err := c.Validate(); err != nil {
			err2 = err
			return
		}
	}

	// delete sheet
	if err := cf.DeleteSheet(); err != nil {
		err2 = fmt.Errorf("目録ファイルのシート削除に失敗しました。: %w", err)
		return
	}

	catalogData, err := cf.File().WriteToBuffer()
	if err != nil {
		err2 = fmt.Errorf("目録ファイルの書き出しに失敗しました。: %w", err)
		return
	}

	b = catalogData.Bytes()
	return
}

func (s *Services) parseCatalog(ctx context.Context, catalogURL string) (c *Catalog, cf *CatalogFile, _ error) {
	catalogAssetRes, err := http.DefaultClient.Do(util.DR(
		http.NewRequestWithContext(ctx, http.MethodGet, catalogURL, nil)))
	if err != nil {
		return c, cf, fmt.Errorf("アセットの取得に失敗しました: %w", err)
	}
	if catalogAssetRes.StatusCode != 200 {
		return c, cf, fmt.Errorf("アセットの取得に失敗しました: ステータスコード %d", catalogAssetRes.StatusCode)
	}

	defer catalogAssetRes.Body.Close()

	// parse catalog
	xf, err := excelize.OpenReader(catalogAssetRes.Body)
	if err != nil {
		return c, cf, fmt.Errorf("目録を開くことできませんでした: %w", err)
	}

	cf = NewCatalogFile(xf)
	c, err = cf.Parse()
	if err != nil {
		return c, cf, fmt.Errorf("目録の読み込みに失敗しました: %w", err)
	}

	return c, cf, nil
}

func (s *Services) findOrCreatePackage(ctx context.Context, c *Catalog, cityCode, cityName string, dataYear int) (*ckan.Package, error) {
	// find
	pkg, pkgName, err := s.findPackage(ctx, cityCode, cityName, dataYear)
	if err != nil {
		return nil, fmt.Errorf("G空間情報センターからデータセットを検索できませんでした: %w", err)
	}

	// create
	if pkg == nil {
		if c == nil {
			return nil, errors.New("目録ファイルにG空間情報センター用メタデータシートがありません。")
		}

		newpkg := lo.ToPtr(packageFromCatalog(c, s.CkanOrg, pkgName, s.CkanPrivate))
		log.Infofc(ctx, "geospartialjp: package %s not found so new package will be created", pkgName)

		pkg2, err := s.Ckan.CreatePackage(ctx, *newpkg)
		if err != nil {
			return nil, fmt.Errorf("G空間情報センターにデータセット %s を作成できませんでした: %w", pkgName, err)
		}
		return &pkg2, nil
	}

	// update (currently disabled)
	// if c != nil {
	// 	newpkg := lo.ToPtr(packageFromCatalog(c, s.CkanOrg, pkgName, s.CkanPrivate))
	// 	newpkg.ID = pkg.ID
	// 	pkg2, err := s.Ckan.PatchPackage(ctx, *newpkg)
	// 	if err != nil {
	// 		return nil, fmt.Errorf("G空間情報センターのデータセット %s を更新できませんでした: %w", pkgName, err)
	// 	}
	// 	return &pkg2, nil
	// }

	return pkg, nil
}

func (s *Services) findPackage(ctx context.Context, cityCode, cityName string, year int) (_ *ckan.Package, n string, err error) {
	// pattern1 -shi
	name := datasetName(cityCode, cityName, year)
	p, _ := s.Ckan.ShowPackage(ctx, name)
	if p.Name != "" {
		return &p, p.Name, nil
	}

	// pattern2 -city
	name2 := datasetName(cityCode, strings.Replace(cityName, "-shi", "-city", 1), year)
	if name != name2 {
		p, _ = s.Ckan.ShowPackage(ctx, name2)
		if p.Name != "" {
			return &p, p.Name, nil
		}
	}

	return nil, name, nil
}

func (s *Services) commentToItem(ctx context.Context, itemID, comment string) {
	if err2 := s.CMS.CommentToItem(ctx, itemID, comment); err2 != nil {
		log.Errorfc(ctx, "failed to comment to item %s: %s", itemID, err2)
	}
}
