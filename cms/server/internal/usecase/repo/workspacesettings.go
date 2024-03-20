package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
)

type WorkspaceSettings interface {
	Filtered(filter WorkspaceFilter) WorkspaceSettings
	FindByID(context.Context, accountdomain.WorkspaceID) (*workspacesettings.WorkspaceSettings, error)
	FindByIDs(context.Context, accountdomain.WorkspaceIDList) (workspacesettings.List, error)
	Save(context.Context, *workspacesettings.WorkspaceSettings) error
	Remove(context.Context, accountdomain.WorkspaceID) error
}
