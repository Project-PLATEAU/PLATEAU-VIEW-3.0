package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

type CreateViewParam struct {
	Name    string
	Project view.ProjectID
	Model   view.ModelID
	Filter  *view.Condition
	Sort    *view.Sort
	Columns *view.ColumnList
}

type UpdateViewParam struct {
	ID      view.ID
	Name    *string
	Filter  *view.Condition
	Sort    *view.Sort
	Columns *view.ColumnList
}

var (
	ErrLastView = rerror.NewE(i18n.T("model should have at least one view"))
)

type View interface {
	FindByIDs(context.Context, view.IDList, *usecase.Operator) (view.List, error)
	FindByModel(context.Context, view.ModelID, *usecase.Operator) (view.List, error)
	Create(context.Context, CreateViewParam, *usecase.Operator) (*view.View, error)
	Update(context.Context, view.ID, UpdateViewParam, *usecase.Operator) (*view.View, error)
	Delete(context.Context, view.ID, *usecase.Operator) error
}
