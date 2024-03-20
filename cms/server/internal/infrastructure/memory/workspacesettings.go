package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type WorkspaceSettingsRepo struct {
	data *util.SyncMap[accountdomain.WorkspaceID, *workspacesettings.WorkspaceSettings]
	f    repo.WorkspaceFilter
	err  error
}

func NewWorkspaceSettings() repo.WorkspaceSettings {
	return &WorkspaceSettingsRepo{
		data: &util.SyncMap[accountdomain.WorkspaceID, *workspacesettings.WorkspaceSettings]{},
	}
}

func (r *WorkspaceSettingsRepo) Filtered(f repo.WorkspaceFilter) repo.WorkspaceSettings {
	return &WorkspaceSettingsRepo{
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *WorkspaceSettingsRepo) FindByID(ctx context.Context, wid accountdomain.WorkspaceID) (*workspacesettings.WorkspaceSettings, error) {
	if r.err != nil {
		return nil, r.err
	}

	ws := r.data.Find(func(k accountdomain.WorkspaceID, v *workspacesettings.WorkspaceSettings) bool {
		return k == wid && r.f.CanRead(v.ID())
	})

	if ws != nil {
		return ws, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *WorkspaceSettingsRepo) FindByIDs(ctx context.Context, ids accountdomain.WorkspaceIDList) (workspacesettings.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	result := r.data.FindAll(func(k accountdomain.WorkspaceID, i *workspacesettings.WorkspaceSettings) bool {
		return ids.Has(k) && r.f.CanRead(i.ID())
	})

	return workspacesettings.List(result).SortByID(), nil

}

func (r *WorkspaceSettingsRepo) Save(ctx context.Context, ws *workspacesettings.WorkspaceSettings) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(ws.ID()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(ws.ID(), ws)
	return nil
}

func (r *WorkspaceSettingsRepo) Remove(ctx context.Context, wid accountdomain.WorkspaceID) error {
	if r.err != nil {
		return r.err
	}

	if i, ok := r.data.Load(wid); ok && r.f.CanWrite(i.ID()) {
		r.data.Delete(wid)
		return nil
	}
	return rerror.ErrNotFound

}