package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/samber/lo"
)

func (r *Resolver) Item() ItemResolver {
	return &itemResolver{r}
}

type itemResolver struct{ *Resolver }

func (i itemResolver) CreatedBy(ctx context.Context, obj *gqlmodel.Item) (gqlmodel.Operator, error) {
	if obj.UserID != nil {
		return dataloaders(ctx).User.Load(*obj.UserID)
	}
	return dataloaders(ctx).Integration.Load(*obj.IntegrationID)
}

func (i itemResolver) UpdatedBy(ctx context.Context, obj *gqlmodel.Item) (gqlmodel.Operator, error) {
	if obj.UpdatedByUserID != nil {
		return dataloaders(ctx).User.Load(*obj.UpdatedByUserID)
	}
	if obj.UpdatedByIntegrationID != nil {
		return dataloaders(ctx).Integration.Load(*obj.UpdatedByIntegrationID)
	}
	return nil, nil
}

func (i itemResolver) Project(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

func (i itemResolver) Schema(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Schema, error) {
	return dataloaders(ctx).Schema.Load(obj.SchemaID)
}

func (i itemResolver) Thread(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Thread, error) {
	return dataloaders(ctx).Thread.Load(obj.ThreadID)
}

func (i itemResolver) Model(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Model, error) {
	return dataloaders(ctx).Model.Load(obj.ModelID)
}

func (i itemResolver) Status(ctx context.Context, obj *gqlmodel.Item) (gqlmodel.ItemStatus, error) {
	return dataloaders(ctx).ItemStatus.Load(obj.ID)
}

func (i itemResolver) Assets(ctx context.Context, obj *gqlmodel.Item) ([]*gqlmodel.Asset, error) {

	aIds := lo.FlatMap(obj.Fields, func(f *gqlmodel.ItemField, _ int) []gqlmodel.ID {
		if f.Type != gqlmodel.SchemaFieldTypeAsset || f.Value == nil {
			return nil
		}
		if s, ok := f.Value.(string); ok {
			return []gqlmodel.ID{gqlmodel.ID(s)}
		}
		if ss, ok := f.Value.([]any); ok {
			return lo.FilterMap(ss, func(i any, _ int) (gqlmodel.ID, bool) {
				if str, ok := i.(string); ok {
					return gqlmodel.ID(str), ok
				}
				return "", false
			})
		}
		return nil
	})

	assets, err := dataloaders(ctx).Asset.LoadAll(aIds)
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}
	return assets, nil
}

func (i itemResolver) Metadata(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Item, error) {
	if obj.MetadataID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Item.Load(*obj.MetadataID)
}

func (i itemResolver) Original(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Item, error) {
	if obj.OriginalID == nil {
		return nil, nil
	}
	return dataloaders(ctx).Item.Load(*obj.OriginalID)
}

func (i itemResolver) ReferencedItems(ctx context.Context, obj *gqlmodel.Item) ([]*gqlmodel.Item, error) {
	refIds := lo.FlatMap(obj.Fields, func(f *gqlmodel.ItemField, _ int) []gqlmodel.ID {
		if f.Type != gqlmodel.SchemaFieldTypeReference || f.Value == nil {
			return nil
		}
		if s, ok := f.Value.(string); ok {
			return []gqlmodel.ID{gqlmodel.ID(s)}
		}
		if ss, ok := f.Value.([]any); ok {
			return lo.FilterMap(ss, func(i any, _ int) (gqlmodel.ID, bool) {
				if str, ok := i.(string); ok {
					return gqlmodel.ID(str), ok
				}
				return "", false
			})
		}
		return nil
	})

	refItems, err := dataloaders(ctx).Item.LoadAll(refIds)
	if len(err) > 0 && err[0] != nil {
		return nil, err[0]
	}
	return refItems, nil
}
