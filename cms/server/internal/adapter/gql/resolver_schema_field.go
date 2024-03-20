package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) SchemaField() SchemaFieldResolver {
	return &schemaFieldResolver{r}
}

type schemaFieldResolver struct{ *Resolver }

func (s schemaFieldResolver) Model(ctx context.Context, obj *gqlmodel.SchemaField) (*gqlmodel.Model, error) {
	if obj.ModelID != nil {
		return dataloaders(ctx).Model.Load(*obj.ModelID)
	}
	return nil, nil
}
