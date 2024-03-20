package gql

import (
	"context"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Group() GroupResolver {
	return &groupResolver{r}
}

type groupResolver struct{ *Resolver }

func (g groupResolver) Schema(ctx context.Context, obj *gqlmodel.Group) (*gqlmodel.Schema, error) {
	return dataloaders(ctx).Schema.Load(obj.SchemaID)
}
func (g groupResolver) Project(ctx context.Context, obj *gqlmodel.Group) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}
