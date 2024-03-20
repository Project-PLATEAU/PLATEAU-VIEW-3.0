package memory

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type View struct {
	data *util.SyncMap[id.ViewID, *view.View]
	f    repo.ProjectFilter
	now  *util.TimeNow
	err  error
}

func NewView() repo.View {
	return &View{
		data: &util.SyncMap[id.ViewID, *view.View]{},
		now:  &util.TimeNow{},
	}
}

func (r *View) Filtered(f repo.ProjectFilter) repo.View {
	return &View{
		data: r.data,
		f:    r.f.Merge(f),
		now:  &util.TimeNow{},
	}
}

func (r *View) FindByID(_ context.Context, iId id.ViewID) (*view.View, error) {
	if r.err != nil {
		return nil, r.err
	}

	i := r.data.Find(func(k id.ViewID, i *view.View) bool {
		return k == iId && r.f.CanRead(i.Project())
	})

	if i != nil {
		return i, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *View) FindByModel(_ context.Context, mID id.ModelID) (view.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	i := r.data.FindAll(func(_ id.ViewID, i *view.View) bool {
		return i.Model() == mID && r.f.CanRead(i.Project())
	})

	if i != nil {
		return i, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *View) FindByIDs(_ context.Context, iIds id.ViewIDList) (view.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	result := r.data.FindAll(func(k id.ViewID, i *view.View) bool {
		return iIds.Has(k) && r.f.CanRead(i.Project())
	})

	return view.List(result).SortByID(), nil
}

func (r *View) Save(_ context.Context, i *view.View) error {
	if !r.f.CanWrite(i.Project()) {
		return repo.ErrOperationDenied
	}

	if r.err != nil {
		return r.err
	}

	r.data.Store(i.ID(), i)
	return nil
}

func (r *View) Remove(_ context.Context, iId id.ViewID) error {
	if r.err != nil {
		return r.err
	}

	if i, ok := r.data.Load(iId); ok && r.f.CanWrite(i.Project()) {
		r.data.Delete(iId)
		return nil
	}
	return rerror.ErrNotFound
}

func MockViewNow(r repo.View, t time.Time) func() {
	return r.(*View).now.Mock(t)
}

func SetViewError(r repo.View, err error) {
	r.(*View).err = err
}
