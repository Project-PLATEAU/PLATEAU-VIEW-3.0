package gql

import (
	"context"
	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func (r *mutationResolver) CreateItem(ctx context.Context, input gqlmodel.CreateItemInput) (*gqlmodel.ItemPayload, error) {
	op := getOperator(ctx)
	sid, err := gqlmodel.ToID[id.Schema](input.SchemaID)
	if err != nil {
		return nil, err
	}
	mid, err := gqlmodel.ToID[id.Model](input.ModelID)
	if err != nil {
		return nil, err
	}
	m, err := usecases(ctx).Model.FindByID(ctx, mid, op)
	if err != nil {
		return nil, err
	}

	ss, gs, err := usecases(ctx).Schema.GetSchemasAndGroupSchemasByIDs(ctx, id.SchemaIDList{m.Schema()}, op)
	if err != nil {
		return nil, err
	}
	res, err := usecases(ctx).Item.Create(ctx, interfaces.CreateItemParam{
		SchemaID:   sid,
		ModelID:    mid,
		MetadataID: gqlmodel.ToIDRef[id.Item](input.MetadataID),
		Fields:     util.DerefSlice(util.Map(input.Fields, gqlmodel.ToItemParam)),
	}, op)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ItemPayload{
		Item: gqlmodel.ToItem(res, ss[0], gs),
	}, nil
}

func (r *mutationResolver) UpdateItem(ctx context.Context, input gqlmodel.UpdateItemInput) (*gqlmodel.ItemPayload, error) {
	op := getOperator(ctx)
	iid, err := gqlmodel.ToID[id.Item](input.ItemID)
	if err != nil {
		return nil, err
	}

	var v version.Version
	if input.Version != nil {
		u, err := uuid.Parse(*input.Version)
		if err != nil {
			return nil, err
		}
		v = version.Version(u)
	}

	res, err := usecases(ctx).Item.Update(ctx, interfaces.UpdateItemParam{
		ItemID:     iid,
		MetadataID: gqlmodel.ToIDRef[id.Item](input.MetadataID),
		Fields:     util.DerefSlice(util.Map(input.Fields, gqlmodel.ToItemParam)),
		Version:    &v,
	}, op)
	if err != nil {
		return nil, err
	}

	ss, gs, err := usecases(ctx).Schema.GetSchemasAndGroupSchemasByIDs(ctx, id.SchemaIDList{res.Value().Schema()}, op)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ItemPayload{
		Item: gqlmodel.ToItem(res, ss[0], gs),
	}, nil
}

func (r *mutationResolver) DeleteItem(ctx context.Context, input gqlmodel.DeleteItemInput) (*gqlmodel.DeleteItemPayload, error) {
	iid, err := gqlmodel.ToID[id.Item](input.ItemID)
	if err != nil {
		return nil, err
	}

	if err := usecases(ctx).Item.Delete(ctx, iid, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteItemPayload{ItemID: input.ItemID}, nil
}

func (r *mutationResolver) UnpublishItem(ctx context.Context, input gqlmodel.UnpublishItemInput) (*gqlmodel.UnpublishItemPayload, error) {
	op := getOperator(ctx)
	iid, err := gqlmodel.ToIDs[id.Item](input.ItemIds)
	if err != nil {
		return nil, err
	}
	res, err := usecases(ctx).Item.Unpublish(ctx, iid, op)
	if err != nil {
		return nil, err
	}
	s, err := usecases(ctx).Schema.FindByID(ctx, res[0].Value().Schema(), op)
	if err != nil {
		return nil, err
	}
	return &gqlmodel.UnpublishItemPayload{
		Items: lo.Map(res, func(t item.Versioned, _ int) *gqlmodel.Item { return gqlmodel.ToItem(t, s, nil) }),
	}, nil
}

func (r *mutationResolver) PublishItem(ctx context.Context, input gqlmodel.PublishItemInput) (*gqlmodel.PublishItemPayload, error) {
	op := getOperator(ctx)

	iid, err := gqlmodel.ToIDs[id.Item](input.ItemIds)
	if err != nil {
		return nil, err
	}
	itm, err := usecases(ctx).Item.Publish(ctx, iid, op)
	if err != nil {
		return nil, err
	}
	s, err := usecases(ctx).Schema.FindByID(ctx, itm[0].Value().Schema(), op)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.PublishItemPayload{
		Items: lo.Map(itm, func(t item.Versioned, _ int) *gqlmodel.Item { return gqlmodel.ToItem(t, s, nil) }),
	}, nil
}
