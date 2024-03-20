package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func (r *mutationResolver) CreateField(ctx context.Context, input gqlmodel.CreateFieldInput) (*gqlmodel.FieldPayload, error) {
	mid := gqlmodel.ToIDRef[id.Model](input.ModelID)
	gid := gqlmodel.ToIDRef[id.Group](input.GroupID)
	param := interfaces.FindOrCreateSchemaParam{
		ModelID:  mid,
		GroupID:  gid,
		Metadata: input.Metadata,
		Create:   true,
	}
	s, err := usecases(ctx).Model.FindOrCreateSchema(ctx, param, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	tp, dv, err := gqlmodel.FromSchemaTypeProperty(input.TypeProperty, input.Type, input.Multiple)
	if err != nil {
		return nil, err
	}

	f, err := usecases(ctx).Schema.CreateField(ctx, interfaces.CreateFieldParam{
		ModelID:      mid,
		SchemaID:     s.ID(),
		Type:         gqlmodel.FromValueType(input.Type),
		Name:         input.Title,
		Description:  input.Description,
		Key:          input.Key,
		Multiple:     input.Multiple,
		Unique:       input.Unique,
		Required:     input.Required,
		IsTitle:      input.IsTitle,
		DefaultValue: dv,
		TypeProperty: tp,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.FieldPayload{
		Field: gqlmodel.ToSchemaField(f, s.TitleField()),
	}, nil
}

func (r *mutationResolver) UpdateField(ctx context.Context, input gqlmodel.UpdateFieldInput) (*gqlmodel.FieldPayload, error) {
	fid, err := gqlmodel.ToID[id.Field](input.FieldID)
	if err != nil {
		return nil, err
	}

	mid := gqlmodel.ToIDRef[id.Model](input.ModelID)
	gid := gqlmodel.ToIDRef[id.Group](input.GroupID)
	param := interfaces.FindOrCreateSchemaParam{
		ModelID:  mid,
		GroupID:  gid,
		Metadata: input.Metadata,
		Create:   true,
	}
	s, err := usecases(ctx).Model.FindOrCreateSchema(ctx, param, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	dbField := s.Field(fid)

	tp, dv, err := gqlmodel.FromSchemaTypeProperty(input.TypeProperty, gqlmodel.ToValueType(dbField.Type()), lo.FromPtrOr(input.Multiple, dbField.Multiple()))
	if err != nil {
		return nil, err
	}

	f, err := usecases(ctx).Schema.UpdateField(ctx, interfaces.UpdateFieldParam{
		ModelID:      mid,
		SchemaID:     s.ID(),
		FieldID:      fid,
		Name:         input.Title,
		Description:  input.Description,
		Key:          input.Key,
		Multiple:     input.Multiple,
		Order:        input.Order,
		Unique:       input.Unique,
		Required:     input.Required,
		IsTitle:      input.IsTitle,
		DefaultValue: dv,
		TypeProperty: tp,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.FieldPayload{
		Field: gqlmodel.ToSchemaField(f, s.TitleField()),
	}, nil
}

func (r *mutationResolver) DeleteField(ctx context.Context, input gqlmodel.DeleteFieldInput) (*gqlmodel.DeleteFieldPayload, error) {
	fid, err := gqlmodel.ToID[id.Field](input.FieldID)
	if err != nil {
		return nil, err
	}

	mid := gqlmodel.ToIDRef[id.Model](input.ModelID)
	gid := gqlmodel.ToIDRef[id.Group](input.GroupID)
	param := interfaces.FindOrCreateSchemaParam{
		ModelID:  mid,
		GroupID:  gid,
		Metadata: input.Metadata,
		Create:   true,
	}
	s, err := usecases(ctx).Model.FindOrCreateSchema(ctx, param, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	if err := usecases(ctx).Schema.DeleteField(ctx, s.ID(), fid, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteFieldPayload{
		FieldID: input.FieldID,
	}, nil
}

func (r *mutationResolver) UpdateFields(ctx context.Context, input []*gqlmodel.UpdateFieldInput) (*gqlmodel.FieldsPayload, error) {
	mid := gqlmodel.ToIDRef[id.Model](input[0].ModelID)
	gid := gqlmodel.ToIDRef[id.Group](input[0].GroupID)
	param := interfaces.FindOrCreateSchemaParam{
		ModelID:  mid,
		GroupID:  gid,
		Metadata: input[0].Metadata,
		Create:   true,
	}
	s, err := usecases(ctx).Model.FindOrCreateSchema(ctx, param, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	params, err := util.TryMap(input, func(ipt *gqlmodel.UpdateFieldInput) (interfaces.UpdateFieldParam, error) {
		fid, err := gqlmodel.ToID[id.Field](ipt.FieldID)
		if err != nil {
			return interfaces.UpdateFieldParam{}, err
		}
		dbField := s.Field(fid)

		tp, dv, err := gqlmodel.FromSchemaTypeProperty(ipt.TypeProperty, gqlmodel.ToValueType(dbField.Type()), dbField.Multiple())
		if err != nil {
			return interfaces.UpdateFieldParam{}, err
		}
		return interfaces.UpdateFieldParam{
			SchemaID:     s.ID(),
			FieldID:      fid,
			Name:         ipt.Title,
			Description:  ipt.Description,
			Key:          ipt.Key,
			Multiple:     ipt.Multiple,
			Order:        ipt.Order,
			Unique:       ipt.Unique,
			IsTitle:      ipt.IsTitle,
			Required:     ipt.Required,
			DefaultValue: dv,
			TypeProperty: tp,
		}, nil
	})
	if err != nil {
		return nil, err
	}

	fl, err := usecases(ctx).Schema.UpdateFields(ctx, s.ID(), params, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.FieldsPayload{
		Fields: lo.Map(fl, func(sf *schema.Field, _ int) *gqlmodel.SchemaField {
			return gqlmodel.ToSchemaField(sf, s.TitleField())
		}),
	}, nil
}
