package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
)

type UpdateOrCreateWorkspaceSettingsParam struct {
	ID       accountdomain.WorkspaceID // same as workspace ID
	Tiles    *workspacesettings.ResourceList
	Terrains *workspacesettings.ResourceList
}

type DeleteWorkspaceSettingsParam struct {
	ID accountdomain.WorkspaceID // same as workspace ID
}

type WorkspaceSettings interface {
	Fetch(context.Context, accountdomain.WorkspaceIDList, *usecase.Operator) (workspacesettings.List, error)
	UpdateOrCreate(context.Context, UpdateOrCreateWorkspaceSettingsParam, *usecase.Operator) (*workspacesettings.WorkspaceSettings, error)
	Delete(context.Context, DeleteWorkspaceSettingsParam, *usecase.Operator) error
}
