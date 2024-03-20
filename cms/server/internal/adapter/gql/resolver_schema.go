package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/samber/lo"
)

func (r *Resolver) Schema() SchemaResolver {
	return &schemaResolver{r}
}

type schemaResolver struct{ *Resolver }

func (s schemaResolver) Project(ctx context.Context, obj *gqlmodel.Schema) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

func (s schemaResolver) TitleField(ctx context.Context, obj *gqlmodel.Schema) (*gqlmodel.SchemaField, error) {
	if obj.TitleFieldID == nil {
		return nil, nil
	}
	ss, err := dataloaders(ctx).Schema.Load(obj.ID)
	if err != nil {
		return nil, err
	}
	ff, ok := lo.Find(ss.Fields, func(f *gqlmodel.SchemaField) bool {
		return f.ID == *obj.TitleFieldID
	})
	if !ok {
		return nil, nil
	}
	return ff, nil
}
