package sdkapiv2

import (
	"context"
	"fmt"
	"net/url"
	"path"
	"strings"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

const limit = 10

type CMS struct {
	Project              string
	PublicAPI            bool
	IntegrationAPIClient cms.Interface
	PublicAPIClient      *cms.PublicAPIClient[Item]
}

func NewCMS(c cms.Interface, pac *cms.PublicAPIClient[Item], project string, usePublic bool) *CMS {
	return &CMS{
		Project:              project,
		PublicAPI:            usePublic,
		IntegrationAPIClient: c,
		PublicAPIClient:      pac,
	}
}

func (c *CMS) Datasets(ctx context.Context, model string) (*DatasetResponse, error) {
	if c.PublicAPI {
		return c.DatasetsWithPublicAPI(ctx, model)
	}
	return c.DatasetsWithIntegrationAPI(ctx, model)
}

func (c *CMS) Files(ctx context.Context, model, id string) (FilesResponse, error) {
	if c.PublicAPI {
		return c.FilesWithPublicAPI(ctx, model, id)
	}
	return c.FilesWithIntegrationAPI(ctx, model, id)
}

func (c *CMS) DatasetsWithPublicAPI(ctx context.Context, model string) (*DatasetResponse, error) {
	items, err := c.PublicAPIClient.GetAllItemsInParallel(ctx, c.Project, model, limit)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	return Items(items).DatasetResponse(), nil
}

func (c *CMS) FilesWithPublicAPI(ctx context.Context, model, id string) (FilesResponse, error) {
	item, err := c.PublicAPIClient.GetItem(ctx, c.Project, model, id)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}
	if item.CityGML == nil || item.MaxLOD == nil {
		return nil, rerror.ErrNotFound
	}

	asset, err := c.PublicAPIClient.GetAsset(ctx, c.Project, item.CityGML.ID)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	maxlod, err := getMaxLOD(ctx, item.MaxLOD.URL)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	res, warning := MaxLODFiles(maxlod, asset.Files, nil)
	if len(warning) > 0 {
		log.Warnfc(ctx, "sdkapi: warning: %s", strings.Join(warning, "\n"))
	}

	return res, nil
}

func (c *CMS) DatasetsWithIntegrationAPI(ctx context.Context, model string) (*DatasetResponse, error) {
	items, err := c.IntegrationAPIClient.GetItemsByKey(ctx, c.Project, model, true)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	return ItemsFromIntegration(items.Items).DatasetResponse(), nil
}

func (c *CMS) FilesWithIntegrationAPI(ctx context.Context, model, id string) (FilesResponse, error) {
	item, err := c.IntegrationAPIClient.GetItem(ctx, id, true)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	iitem := ItemFromIntegration(item)
	if iitem.CityGML == nil || iitem.MaxLOD == nil || !iitem.IsPublic() {
		return nil, rerror.ErrNotFound
	}

	asset, err := c.IntegrationAPIClient.Asset(ctx, iitem.CityGML.ID)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}
	if asset.File == nil {
		return nil, rerror.ErrNotFound
	}

	assetURL, err := url.Parse(asset.URL)
	if asset.File == nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("failed to parse asset url %s: %w", asset.URL, err))
	}

	assetBase := util.CloneRef(assetURL)
	assetBase.Path = path.Dir(assetBase.Path)

	maxlod, err := getMaxLOD(ctx, iitem.MaxLOD.URL)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	res, warning := MaxLODFiles(maxlod, asset.File.Paths(), assetBase)
	if len(warning) > 0 {
		log.Warnfc(ctx, "sdkapi: warning: %s", strings.Join(warning, "\n"))
	}

	return res, nil
}
