package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/samber/lo"
)

func (r *Resolver) SchemaFieldReference() SchemaFieldReferenceResolver {
	return &schemaFieldReferenceResolver{r}
}

type schemaFieldReferenceResolver struct{ *Resolver }

func (s schemaFieldReferenceResolver) Schema(ctx context.Context, obj *gqlmodel.SchemaFieldReference) (*gqlmodel.Schema, error) {
	return dataloaders(ctx).Schema.Load(obj.SchemaID)
}

func (s schemaFieldReferenceResolver) CorrespondingField(ctx context.Context, obj *gqlmodel.SchemaFieldReference) (*gqlmodel.SchemaField, error) {
	if obj.CorrespondingFieldID == nil {
		return nil, nil
	}
	ss, err := dataloaders(ctx).Schema.Load(obj.SchemaID)
	if err != nil {
		return nil, err
	}
	ff, ok := lo.Find(ss.Fields, func(f *gqlmodel.SchemaField) bool {
		return f.ID == *obj.CorrespondingFieldID
	})
	if !ok {
		return nil, nil
	}

	return ff, nil
}
