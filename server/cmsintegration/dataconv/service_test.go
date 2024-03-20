package dataconv

import (
	"context"
	"io"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/rerror"
)

type cmsMock struct {
	cms.Interface
	i *cms.Item
}

func (c *cmsMock) GetItem(ctx context.Context, itemID string, asset bool) (*cms.Item, error) {
	return &cms.Item{
		ID: itemID,
		Fields: Item{
			Type:       "行政界",
			DataFormat: "GeoJSON",
			Data:       "aaa",
		}.Fields(),
	}, nil
}

func (c *cmsMock) UpdateItem(ctx context.Context, itemID string, fields []*cms.Field, metadataFields []*cms.Field) (*cms.Item, error) {
	c.i = &cms.Item{
		ID:     itemID,
		Fields: fields,
	}
	return nil, nil
}

func (c *cmsMock) Asset(ctx context.Context, id string) (*cms.Asset, error) {
	if id == "aaa" {
		return &cms.Asset{
			URL: borderURL,
		}, nil
	}
	return nil, rerror.ErrNotFound
}

func (c *cmsMock) UploadAssetDirectly(ctx context.Context, projectID, name string, data io.Reader) (string, error) {
	return "asset", nil
}
