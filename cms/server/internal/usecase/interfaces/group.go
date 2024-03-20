package interfaces

import (
	"context"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var ErrDelGroupUsed = rerror.NewE(i18n.T("can't delete a group as it's used by some models"))

type CreateGroupParam struct {
	ProjectId   id.ProjectID
	Name        string
	Key         string
	Description *string
}

type UpdateGroupParam struct {
	GroupID     id.GroupID
	Name        *string
	Description *string
	Key         *string
}

type Group interface {
	FindByID(context.Context, id.GroupID, *usecase.Operator) (*group.Group, error)
	FindByIDs(context.Context, id.GroupIDList, *usecase.Operator) (group.List, error)
	FindByProject(context.Context, id.ProjectID, *usecase.Operator) (group.List, error)
	FindByModel(context.Context, id.ModelID, *usecase.Operator) (group.List, error)
	FindByKey(context.Context, id.ProjectID, string, *usecase.Operator) (*group.Group, error)
	Create(context.Context, CreateGroupParam, *usecase.Operator) (*group.Group, error)
	Update(context.Context, UpdateGroupParam, *usecase.Operator) (*group.Group, error)
	CheckKey(context.Context, id.ProjectID, string) (bool, error)
	FindModelsByGroup(context.Context, id.GroupID, *usecase.Operator) (model.List, error)
	Delete(context.Context, id.GroupID, *usecase.Operator) error
}
