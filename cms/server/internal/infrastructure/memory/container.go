package memory

import (
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/reearth/reearthx/usecasex"
)

func New() *repo.Container {
	return &repo.Container{
		Asset:             NewAsset(),
		AssetFile:         NewAssetFile(),
		Lock:              NewLock(),
		Request:           NewRequest(),
		User:              accountmemory.NewUser(),
		Workspace:         accountmemory.NewWorkspace(),
		Project:           NewProject(),
		Model:             NewModel(),
		Item:              NewItem(),
		View:              NewView(),
		Schema:            NewSchema(),
		Integration:       NewIntegration(),
		Thread:            NewThread(),
		Event:             NewEvent(),
		Group:             NewGroup(),
		WorkspaceSettings: NewWorkspaceSettings(),
		Transaction:       &usecasex.NopTransaction{},
	}
}

func MockNow(r *repo.Container, t time.Time) func() {
	p := r.Project.(*Project).now.Mock(t)

	return func() {
		p()
	}
}
