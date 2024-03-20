package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

type AssetUpload struct {
	client *mongox.Collection
}

func NewAssetUpload(client *mongox.Client) repo.AssetUpload {
	return &AssetUpload{client: client.WithCollection("asset_upload")}
}

func (r *AssetUpload) Init() error {
	return createIndexes2(context.Background(), r.client,
		mongox.IndexFromKey("uuid", true),
		mongox.TTLIndexFromKey("expires_at", 0),
	)
}

func (r *AssetUpload) FindByID(ctx context.Context, uuid string) (*asset.Upload, error) {
	c := mongodoc.NewAssetUploadConsumer()
	if err := r.client.FindOne(ctx, bson.M{"uuid": uuid}, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *AssetUpload) Save(ctx context.Context, upload *asset.Upload) error {
	doc := mongodoc.NewAssetUpload(upload)
	return r.client.SaveOne(ctx, upload.UUID(), doc)
}
