package repo

import (
	"context"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type Group interface {
	Filtered(ProjectFilter) Group
	FindByID(context.Context, id.GroupID) (*group.Group, error)
	FindByIDs(context.Context, id.GroupIDList) (group.List, error)
	FindByProject(context.Context, id.ProjectID) (group.List, error)
	FindByKey(context.Context, id.ProjectID, string) (*group.Group, error)
	Save(context.Context, *group.Group) error
	Remove(context.Context, id.GroupID) error
}
