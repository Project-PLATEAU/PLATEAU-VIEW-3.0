package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	groupIndexes       = []string{"project,key"}
	groupUniqueIndexes = []string{"id"}
)

type Group struct {
	client *mongox.Collection
	f      repo.ProjectFilter
}

func NewGroup(client *mongox.Client) repo.Group {
	return &Group{client: client.WithCollection("group")}
}

func (r *Group) Init() error {
	return createIndexes(context.Background(), r.client, groupIndexes, groupUniqueIndexes)
}

func (r *Group) Filtered(filter repo.ProjectFilter) repo.Group {
	return &Group{
		client: r.client,
		f:      r.f.Merge(filter),
	}
}

func (r *Group) FindByID(ctx context.Context, gid id.GroupID) (*group.Group, error) {
	return r.findOne(ctx, bson.M{
		"id": gid.String(),
	})
}

func (r *Group) FindByIDs(ctx context.Context, list id.GroupIDList) (group.List, error) {
	if len(list) == 0 {
		return nil, nil
	}

	res, err := r.find(ctx, bson.M{
		"id": bson.M{
			"$in": list.Strings(),
		},
	})
	if err != nil {
		return nil, err
	}
	return prepareGroups(list, res), nil
}

func (r *Group) FindByProject(ctx context.Context, pid id.ProjectID) (group.List, error) {
	if !r.f.CanRead(pid) {
		return nil, nil
	}
	res, err := r.find(ctx, bson.M{
		"project": pid.String(),
	})
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (r *Group) FindByKey(ctx context.Context, projectID id.ProjectID, key string) (*group.Group, error) {
	if len(key) == 0 {
		return nil, rerror.ErrNotFound
	}
	if !r.f.CanRead(projectID) {
		return nil, repo.ErrOperationDenied
	}

	return r.findOne(ctx, bson.M{
		"key":     key,
		"project": projectID.String(),
	})
}

func (r *Group) Save(ctx context.Context, group *group.Group) error {
	if !r.f.CanWrite(group.Project()) {
		return repo.ErrOperationDenied
	}
	doc, mId := mongodoc.NewGroup(group)
	return r.client.SaveOne(ctx, mId, doc)
}

func (r *Group) Remove(ctx context.Context, groupID id.GroupID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": groupID.String()}))
}

func (r *Group) findOne(ctx context.Context, filter any) (*group.Group, error) {
	c := mongodoc.NewGroupConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *Group) find(ctx context.Context, filter any) (group.List, error) {
	c := mongodoc.NewGroupConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *Group) readFilter(filter interface{}) interface{} {
	return applyProjectFilter(filter, r.f.Readable)
}

func (r *Group) writeFilter(filter interface{}) interface{} {
	return applyProjectFilter(filter, r.f.Writable)
}

// prepare filters the results and sorts them according to original IDs list
func prepareGroups(list id.GroupIDList, rows group.List) group.List {
	res := make(group.List, 0, len(list))
	for _, gId := range list {
		for _, r := range rows {
			if r.ID() == gId {
				res = append(res, r)
				break
			}
		}
	}
	return res
}
