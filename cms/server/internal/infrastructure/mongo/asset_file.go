package mongo

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AssetFile struct {
	client           *mongox.Collection
	assetFilesClient *mongox.Collection
}

func NewAssetFile(client *mongox.Client) repo.AssetFile {
	return &AssetFile{
		client:           client.WithCollection("asset"),
		assetFilesClient: client.WithCollection("asset_files"),
	}
}

func (r *AssetFile) Init() error {
	return createIndexes2(
		context.Background(),
		r.assetFilesClient,
		mongox.IndexFromKey("assetid,page", true),
	)
}

func (r *AssetFile) Filtered(f repo.ProjectFilter) repo.Asset {
	return &Asset{
		client: r.client,
	}
}

func (r *AssetFile) FindByID(ctx context.Context, id id.AssetID) (*asset.File, error) {
	c := &mongodoc.AssetAndFileConsumer{}
	if err := r.client.FindOne(ctx, bson.M{
		"id": id.String(),
	}, c, options.FindOne().SetProjection(bson.M{
		"id":        1,
		"file":      1,
		"flatfiles": 1,
	})); err != nil {
		return nil, err
	}
	f := c.Result[0].File.Model()
	if f == nil {
		return nil, rerror.ErrNotFound
	}
	if c.Result[0].FlatFiles {
		var afc mongodoc.AssetFilesConsumer
		if err := r.assetFilesClient.Find(ctx, bson.M{
			"assetid": id.String(),
		}, &afc, options.Find().SetSort(bson.D{
			{Key: "page", Value: 1},
		})); err != nil {
			return nil, err
		}
		f = asset.FoldFiles(afc.Result().Model(), f)
	}
	return f, nil
}

func (r *AssetFile) Save(ctx context.Context, id id.AssetID, file *asset.File) error {
	doc := mongodoc.NewFile(file)
	_, err := r.client.Client().UpdateOne(ctx, bson.M{
		"id": id.String(),
	}, bson.M{
		"$set": bson.M{
			"id":   id.String(),
			"file": doc,
		},
	})
	if errors.Is(err, mongo.ErrNoDocuments) {
		return rerror.ErrNotFound
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *AssetFile) SaveFlat(ctx context.Context, id id.AssetID, parent *asset.File, files []*asset.File) error {
	doc := mongodoc.NewFile(parent)
	_, err := r.client.Client().UpdateOne(ctx, bson.M{
		"id": id.String(),
	}, bson.M{
		"$set": bson.M{
			"id":        id.String(),
			"flatfiles": true,
			"file":      doc,
		},
	})
	if errors.Is(err, mongo.ErrNoDocuments) {
		return rerror.ErrNotFound
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	if err := r.assetFilesClient.RemoveAll(ctx, bson.M{"assetid": id.String()}); err != nil {
		return rerror.ErrInternalBy(err)
	}
	if len(files) == 0 {
		return nil
	}
	filesDoc := mongodoc.NewFiles(id, files)
	writeModels := make([]mongo.WriteModel, 0, len(filesDoc))
	for _, pageDoc := range filesDoc {
		writeModels = append(writeModels, mongo.NewInsertOneModel().SetDocument(pageDoc))
	}
	if _, err := r.assetFilesClient.Client().BulkWrite(ctx, writeModels); err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}
