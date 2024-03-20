package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

var (
	workspaceSettingsIndexes = []string{"id"}
)

type WorkspaceSettingsRepo struct {
	client *mongox.Collection
	f      repo.WorkspaceFilter
}

func NewWorkspaceSettings(client *mongox.Client) repo.WorkspaceSettings {
	return &WorkspaceSettingsRepo{client: client.WithCollection("workspacesettings")}
}

func (r *WorkspaceSettingsRepo) Init() error {
	return createIndexes(context.Background(), r.client, workspaceSettingsIndexes, nil)
}

func (r *WorkspaceSettingsRepo) Filtered(f repo.WorkspaceFilter) repo.WorkspaceSettings {
	return &WorkspaceSettingsRepo{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *WorkspaceSettingsRepo) FindByID(ctx context.Context, wid accountdomain.WorkspaceID) (*workspacesettings.WorkspaceSettings, error) {
	if !r.f.CanRead(wid) {
		return nil, repo.ErrOperationDenied
	}
	filter := bson.M{
		"id": wid.String(),
	}
	res, err := r.findOne(ctx, filter)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (r *WorkspaceSettingsRepo) FindByIDs(ctx context.Context, ids accountdomain.WorkspaceIDList) (workspacesettings.List, error) {
	if ok := lo.EveryBy(ids, func(wid accountdomain.WorkspaceID) bool {
		return r.f.CanRead(wid)
	}); !ok {
		return nil, repo.ErrOperationDenied
	}
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": util.Map(ids, func(id accountdomain.WorkspaceID) string {
				return id.String()
			}),
		},
	}
	res, err := r.find(ctx, filter)
	if err != nil {
		return nil, err
	}
	return filterWorkspaceSettings(ids, res), nil
}

func (r *WorkspaceSettingsRepo) Save(ctx context.Context, ws *workspacesettings.WorkspaceSettings) error {
	if !r.f.CanWrite(ws.ID()) {
		return repo.ErrOperationDenied
	}
	doc, wid := mongodoc.NewWorkspaceSettings(ws)
	return r.client.SaveOne(ctx, wid, doc)
}

func (r *WorkspaceSettingsRepo) Remove(ctx context.Context, wid accountdomain.WorkspaceID) error {
	if !r.f.CanWrite(wid) {
		return repo.ErrOperationDenied
	}
	return r.client.RemoveOne(ctx, bson.M{"id": wid.String()})
}

func (r *WorkspaceSettingsRepo) find(ctx context.Context, filter any) ([]*workspacesettings.WorkspaceSettings, error) {
	c := mongodoc.NewWorkspaceSettingsConsumer()
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *WorkspaceSettingsRepo) findOne(ctx context.Context, filter any) (*workspacesettings.WorkspaceSettings, error) {
	c := mongodoc.NewWorkspaceSettingsConsumer()
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func filterWorkspaceSettings(ids []accountdomain.WorkspaceID, rows []*workspacesettings.WorkspaceSettings) []*workspacesettings.WorkspaceSettings {
	res := make([]*workspacesettings.WorkspaceSettings, 0, len(ids))
	for _, id := range ids {
		for _, r := range rows {
			if r.ID() == id {
				res = append(res, r)
				break
			}
		}
	}
	return res
}