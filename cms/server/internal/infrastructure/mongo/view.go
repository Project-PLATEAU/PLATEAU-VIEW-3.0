package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	viewIndexes       = []string{"project", "model", "schema"}
	viewUniqueIndexes = []string{"id"}
)

type View struct {
	client *mongox.Collection
	f      repo.ProjectFilter
}

func NewView(client *mongox.Client) repo.View {
	return &View{client: client.WithCollection("view")}
}

func (r *View) Init() error {
	return createIndexes(context.Background(), r.client, viewIndexes, viewUniqueIndexes)
}

func (r *View) Filtered(f repo.ProjectFilter) repo.View {
	return &View{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *View) FindByID(ctx context.Context, viewID id.ViewID) (*view.View, error) {
	return r.findOne(ctx, bson.M{
		"id": viewID.String(),
	})
}

func (r *View) FindByIDs(ctx context.Context, ids id.ViewIDList) (view.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	res, err := r.find(ctx, bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	})
	if err != nil {
		return nil, err
	}

	// prepare filters the results and sorts them according to original ids list
	return util.Map(ids, func(sid id.ViewID) *view.View {
		s, ok := lo.Find(res, func(s *view.View) bool {
			return s.ID() == sid
		})
		if !ok {
			return nil
		}
		return s
	}), nil
}

func (r *View) FindByModel(ctx context.Context, modelID view.ModelID) (view.List, error) {
	return r.find(ctx, bson.M{"modelid": modelID.String()})
}

func (r *View) Save(ctx context.Context, view *view.View) error {
	doc, sId := mongodoc.NewView(view)
	return r.client.SaveOne(ctx, sId, doc)
}

func (r *View) Remove(ctx context.Context, viewID id.ViewID) error {
	return r.client.RemoveOne(ctx, bson.M{"id": viewID.String()})
}

func (r *View) findOne(ctx context.Context, filter any) (*view.View, error) {
	c := mongodoc.NewViewConsumer()
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *View) find(ctx context.Context, filter any) (view.List, error) {
	c := mongodoc.NewViewConsumer()
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}
