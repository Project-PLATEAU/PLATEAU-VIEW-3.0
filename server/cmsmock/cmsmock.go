package cmsmock

import (
	"context"
	"io"

	cms "github.com/reearth/reearth-cms-api/go"
)

type CMSMock struct {
	cms.Interface
	getItem             func(ctx context.Context, id string, asset bool) (*cms.Item, error)
	getItemsPartially   func(ctx context.Context, id string, page, perPage int, asset bool) (*cms.Items, error)
	createItem          func(ctx context.Context, modelID string, fields []*cms.Field, metadataFields []*cms.Field) (*cms.Item, error)
	updateItem          func(ctx context.Context, id string, fields []*cms.Field, metadataFields []*cms.Field) (*cms.Item, error)
	asset               func(ctx context.Context, id string) (*cms.Asset, error)
	uploadAsset         func(ctx context.Context, projectID, url string) (string, error)
	uploadAssetDirectly func(ctx context.Context, projectID, name string, r io.Reader) (string, error)
	commentToItem       func(ctx context.Context, assetID, content string) error
	getModels           func(ctx context.Context, projectID string) (*cms.Models, error)
}

var _ cms.Interface = &CMSMock{}

func (c *CMSMock) Reset() {
	c.getItem = nil
	c.getItemsPartially = nil
	c.updateItem = nil
	c.asset = nil
	c.uploadAsset = nil
	c.uploadAssetDirectly = nil
	c.commentToItem = nil
	c.getModels = nil
}

func (c *CMSMock) GetItem(ctx context.Context, id string, asset bool) (*cms.Item, error) {
	return c.getItem(ctx, id, asset)
}

func (c *CMSMock) GetItemsPartially(ctx context.Context, id string, page, perPage int, asset bool) (*cms.Items, error) {
	return c.getItemsPartially(ctx, id, page, perPage, asset)
}

func (c *CMSMock) CreateItem(ctx context.Context, modelID string, fields []*cms.Field, metadataFields []*cms.Field) (*cms.Item, error) {
	return c.createItem(ctx, modelID, fields, metadataFields)
}

func (c *CMSMock) UpdateItem(ctx context.Context, id string, fields []*cms.Field, metadataFields []*cms.Field) (*cms.Item, error) {
	return c.updateItem(ctx, id, fields, metadataFields)
}

func (c *CMSMock) Asset(ctx context.Context, id string) (*cms.Asset, error) {
	return c.asset(ctx, id)
}

func (c *CMSMock) UploadAsset(ctx context.Context, projectID, url string) (string, error) {
	return c.uploadAsset(ctx, projectID, url)
}

func (c *CMSMock) UploadAssetDirectly(ctx context.Context, projectID, name string, r io.Reader) (string, error) {
	return c.uploadAssetDirectly(ctx, projectID, name, r)
}

func (c *CMSMock) CommentToItem(ctx context.Context, assetID, content string) error {
	return c.commentToItem(ctx, assetID, content)
}

func (c *CMSMock) GetModels(ctx context.Context, projectID string) (*cms.Models, error) {
	return c.getModels(ctx, projectID)
}
