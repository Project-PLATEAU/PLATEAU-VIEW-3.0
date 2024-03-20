package interfaces

import (
	"context"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type CreateModelParam struct {
	ProjectId   id.ProjectID
	Name        *string
	Description *string
	Key         *string
	Public      *bool
}

type FindOrCreateSchemaParam struct {
	ModelID *id.ModelID
	GroupID *id.GroupID
	// boolean that identify if it is a metadata
	Metadata *bool
	// boolean to identify if we want to create a metadata schema or just return an error if metadata schema is nil
	Create bool
}

type UpdateModelParam struct {
	ModelID     id.ModelID
	Name        *string
	Description *string
	Key         *string
	Public      *bool
}

var (
	ErrModelKey error = rerror.NewE(i18n.T("model key is already used by another model"))
)

type Model interface {
	FindByID(context.Context, id.ModelID, *usecase.Operator) (*model.Model, error)
	FindByIDs(context.Context, []id.ModelID, *usecase.Operator) (model.List, error)
	FindByProject(context.Context, id.ProjectID, *usecasex.Pagination, *usecase.Operator) (model.List, *usecasex.PageInfo, error)
	FindByKey(context.Context, id.ProjectID, string, *usecase.Operator) (*model.Model, error)
	FindByIDOrKey(context.Context, id.ProjectID, model.IDOrKey, *usecase.Operator) (*model.Model, error)
	FindOrCreateSchema(context.Context, FindOrCreateSchemaParam, *usecase.Operator) (*schema.Schema, error)
	Create(context.Context, CreateModelParam, *usecase.Operator) (*model.Model, error)
	Update(context.Context, UpdateModelParam, *usecase.Operator) (*model.Model, error)
	UpdateOrder(context.Context, id.ModelIDList, *usecase.Operator) (model.List, error)
	CheckKey(context.Context, id.ProjectID, string) (bool, error)
	Delete(context.Context, id.ModelID, *usecase.Operator) error
	Publish(context.Context, id.ModelID, bool, *usecase.Operator) (bool, error)
}
