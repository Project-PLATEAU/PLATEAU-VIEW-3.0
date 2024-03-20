package memory

import (
	"context"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type Group struct {
	data *util.SyncMap[id.GroupID, *group.Group]
	f    repo.ProjectFilter
	now  *util.TimeNow
	err  error
}

func NewGroup() repo.Group {
	return &Group{
		data: &util.SyncMap[id.GroupID, *group.Group]{},
		now:  &util.TimeNow{},
	}
}

func (r *Group) Filtered(filter repo.ProjectFilter) repo.Group {
	return &Group{
		data: r.data,
		f:    r.f.Merge(filter),
		now:  &util.TimeNow{},
	}
}

func (r *Group) FindByID(ctx context.Context, groupID id.GroupID) (*group.Group, error) {
	if r.err != nil {
		return nil, r.err
	}

	m := r.data.Find(func(k id.GroupID, m *group.Group) bool {
		return k == groupID && r.f.CanRead(m.Project())
	})

	if m != nil {
		return m, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Group) FindByIDs(ctx context.Context, list id.GroupIDList) (group.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	result := r.data.FindAll(func(k id.GroupID, m *group.Group) bool {
		return list.Has(k) && r.f.CanRead(m.Project())
	})

	return group.List(result).SortByID(), nil
}

func (r *Group) FindByProject(ctx context.Context, pid id.ProjectID) (group.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	if !r.f.CanRead(pid) {
		return nil, nil
	}

	result := group.List(r.data.FindAll(func(_ id.GroupID, m *group.Group) bool {
		return m.Project() == pid
	})).SortByID()

	return result, nil
}

func (r *Group) FindByKey(ctx context.Context, pid id.ProjectID, key string) (*group.Group, error) {
	if r.err != nil {
		return nil, r.err
	}

	if !r.f.CanRead(pid) {
		return nil, nil
	}

	g := r.data.Find(func(_ id.GroupID, m *group.Group) bool {
		return m.Key().String() == key && m.Project() == pid
	})
	if g == nil {
		return nil, rerror.ErrNotFound
	}

	return g, nil
}

func (r *Group) Save(ctx context.Context, g *group.Group) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(g.Project()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(g.ID(), g)
	return nil
}

func (r *Group) Remove(ctx context.Context, groupID id.GroupID) error {
	if r.err != nil {
		return r.err
	}

	if m, ok := r.data.Load(groupID); ok && r.f.CanWrite(m.Project()) {
		r.data.Delete(groupID)
		return nil
	}
	return rerror.ErrNotFound
}
