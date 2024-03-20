package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

type CreateFieldParam struct {
	ModelID      *id.ModelID
	SchemaID     id.SchemaID
	Type         value.Type
	Name         string
	Description  *string
	Key          string
	Multiple     bool
	Unique       bool
	Required     bool
	IsTitle      bool
	TypeProperty *schema.TypeProperty
	DefaultValue *value.Multiple
}

type UpdateFieldParam struct {
	ModelID      *id.ModelID
	SchemaID     id.SchemaID
	FieldID      id.FieldID
	Name         *string
	Description  *string
	Order        *int
	Key          *string
	Multiple     *bool
	Unique       *bool
	Required     *bool
	IsTitle      *bool
	TypeProperty *schema.TypeProperty
	DefaultValue *value.Multiple
}

var (
	ErrInvalidTypeProperty       = rerror.NewE(i18n.T("invalid type property"))
	ErrReferencedFiledKeyExists  = rerror.NewE(i18n.T("referenced field key exists"))
	ErrReferenceDirectionChanged = rerror.NewE(i18n.T("reference field direction can not be changed"))
	ErrReferenceModelChanged     = rerror.NewE(i18n.T("reference field model can not be changed"))
	ErrFieldNotFound             = rerror.NewE(i18n.T("field not found"))
	ErrInvalidValue              = rerror.NewE(i18n.T("invalid value"))
	ErrEitherModelOrGroup        = rerror.NewE(i18n.T("either model or group should be provided"))
)

type Schema interface {
	FindByID(context.Context, id.SchemaID, *usecase.Operator) (*schema.Schema, error)
	FindByIDs(context.Context, []id.SchemaID, *usecase.Operator) (schema.List, error)
	FindByModel(context.Context, id.ModelID, *usecase.Operator) (*schema.Package, error)
	CreateField(context.Context, CreateFieldParam, *usecase.Operator) (*schema.Field, error)
	UpdateField(context.Context, UpdateFieldParam, *usecase.Operator) (*schema.Field, error)
	UpdateFields(context.Context, id.SchemaID, []UpdateFieldParam, *usecase.Operator) (schema.FieldList, error)
	DeleteField(context.Context, id.SchemaID, id.FieldID, *usecase.Operator) error
	GetSchemasAndGroupSchemasByIDs(context.Context, id.SchemaIDList, *usecase.Operator) (schema.List, schema.List, error)
}
