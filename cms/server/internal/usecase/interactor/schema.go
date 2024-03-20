package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

type Schema struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewSchema(r *repo.Container, g *gateway.Container) interfaces.Schema {
	return &Schema{
		repos:    r,
		gateways: g,
	}
}

func (i Schema) FindByID(ctx context.Context, id id.SchemaID, _ *usecase.Operator) (*schema.Schema, error) {
	return i.repos.Schema.FindByID(ctx, id)
}

func (i Schema) FindByIDs(ctx context.Context, ids []id.SchemaID, _ *usecase.Operator) (schema.List, error) {
	return i.repos.Schema.FindByIDs(ctx, ids)
}

func (i Schema) FindByModel(ctx context.Context, mID id.ModelID, _ *usecase.Operator) (*schema.Package, error) {
	m, err := i.repos.Model.FindByID(ctx, mID)
	if err != nil {
		return nil, err
	}

	sIDs := id.SchemaIDList{m.Schema()}
	if m.Metadata() != nil {
		sIDs = append(sIDs, *m.Metadata())
	}
	sList, err := i.repos.Schema.FindByIDs(ctx, sIDs)
	if err != nil {
		return nil, err
	}
	s := sList.Schema(lo.ToPtr(m.Schema()))
	if s == nil {
		return nil, nil
	}

	groups, err := i.repos.Group.FindByIDs(ctx, s.Groups())
	if err != nil {
		return nil, err
	}

	sl, err := i.repos.Schema.FindByIDs(ctx, groups.SchemaIDs().Add(s.ReferencedSchemas()...))
	if err != nil {
		return nil, err
	}
	gsm := lo.SliceToMap(groups, func(g *group.Group) (id.GroupID, *schema.Schema) {
		return g.ID(), sl.Schema(lo.ToPtr(g.Schema()))
	})
	rs := lo.Map(s.ReferencedSchemas(), func(s schema.ID, _ int) *schema.Schema {
		return sl.Schema(&s)
	})

	return schema.NewPackage(s, sList.Schema(m.Metadata()), gsm, rs), nil
}

func (i Schema) CreateField(ctx context.Context, param interfaces.CreateFieldParam, op *usecase.Operator) (*schema.Field, error) {
	return Run1(ctx, op, i.repos, Usecase().Transaction(), func(ctx context.Context) (*schema.Field, error) {
		s, err := i.repos.Schema.FindByID(ctx, param.SchemaID)
		if err != nil {
			return nil, err
		}

		if !op.IsMaintainingProject(s.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		if param.Key == "" || s.HasFieldByKey(param.Key) {
			return nil, schema.ErrInvalidKey
		}

		f, err := schema.NewField(param.TypeProperty).
			NewID().
			Unique(param.Unique).
			Multiple(param.Multiple).
			Required(param.Required).
			Name(param.Name).
			Description(lo.FromPtr(param.Description)).
			Key(key.New(param.Key)).
			DefaultValue(param.DefaultValue).
			Build()
		if err != nil {
			return nil, err
		}

		if param.Type == value.TypeReference {
			err = i.createCorrespondingField(ctx, s, f, param)
			if err != nil {
				return nil, err
			}
		}

		if param.Type == value.TypeGroup {
			var g *schema.FieldGroup
			param.TypeProperty.Match(schema.TypePropertyMatch{
				Group: func(f *schema.FieldGroup) {
					g = f
				},
			})
			_, err = i.repos.Group.FindByID(ctx, g.Group())
			if err != nil {
				return nil, err
			}
		}

		s.AddField(f)

		if err := setTitleField(&param.IsTitle, s, f.ID().Ref()); err != nil {
			return nil, err
		}

		if err := i.repos.Schema.Save(ctx, s); err != nil {
			return nil, err
		}

		return f, nil
	})
}

func (i Schema) createCorrespondingField(ctx context.Context, s *schema.Schema, f *schema.Field, param interfaces.CreateFieldParam) error {
	rInput, _ := schema.FieldReferenceFromTypeProperty(param.TypeProperty)
	// if the corresponding field is not passed it's not two-way
	if rInput.CorrespondingField() == nil {
		return nil
	}

	rs := s
	if s.ID() != rInput.Schema() {
		s, err := i.repos.Schema.FindByID(ctx, rInput.Schema())
		if err != nil {
			return err
		}
		rs = s
	}

	if rs.HasFieldByKey(rInput.CorrespondingField().Key) {
		return interfaces.ErrReferencedFiledKeyExists
	}

	cf, err := schema.CreateCorrespondingField(s.ID(), *param.ModelID, f, *rInput.CorrespondingField())
	if err != nil {
		return err
	}

	rs.AddField(cf)

	if err := i.repos.Schema.Save(ctx, rs); err != nil {
		return err
	}

	return nil
}

func (i Schema) UpdateField(ctx context.Context, param interfaces.UpdateFieldParam, op *usecase.Operator) (*schema.Field, error) {
	return Run1(ctx, op, i.repos, Usecase().Transaction(), func(ctx context.Context) (*schema.Field, error) {
		s, err := i.repos.Schema.FindByID(ctx, param.SchemaID)
		if err != nil {
			return nil, err
		}

		if !op.IsMaintainingProject(s.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		f := s.Field(param.FieldID)
		if f == nil {
			return nil, interfaces.ErrFieldNotFound
		}

		// check if type is reference
		if f.Type() == value.TypeReference {
			err := i.updateCorrespondingField(ctx, s, f, param)
			if err != nil {
				return nil, err
			}
		}

		if f.Type() == value.TypeGroup {
			var g *schema.FieldGroup
			param.TypeProperty.Match(schema.TypePropertyMatch{
				Group: func(f *schema.FieldGroup) {
					g = f
				},
			})
			_, err = i.repos.Group.FindByID(ctx, g.Group())
			if err != nil {
				return nil, err
			}
		}

		if err := updateField(param, f); err != nil {
			return nil, err
		}

		if err := setTitleField(param.IsTitle, s, f.ID().Ref()); err != nil {
			return nil, err
		}

		if err := i.repos.Schema.Save(ctx, s); err != nil {
			return nil, err
		}

		return f, nil
	})
}

func setTitleField(isTitle *bool, s *schema.Schema, fid *id.FieldID) error {
	if isTitle == nil || s == nil || fid == nil {
		return nil
	}

	if *isTitle {
		// Set title field if isTitle is true
		if err := s.SetTitleField(fid.Ref()); err != nil {
			return err
		}
	} else if s.TitleField() != nil && *s.TitleField() == *fid {
		// Unset title field if isTitle is false and the current field is the title field
		if err := s.SetTitleField(nil); err != nil {
			return err
		}
	}

	return nil
}

func (i Schema) updateCorrespondingField(ctx context.Context, s *schema.Schema, f *schema.Field, param interfaces.UpdateFieldParam) error {
	oldFr, _ := schema.FieldReferenceFromTypeProperty(f.TypeProperty())
	newFr, _ := schema.FieldReferenceFromTypeProperty(param.TypeProperty)

	// check if reference direction is changed
	if (oldFr.CorrespondingFieldID() == nil) != (newFr.CorrespondingField() == nil) {
		return interfaces.ErrReferenceDirectionChanged
	}

	// if it's not two-way reference no need to update
	if newFr.CorrespondingField() == nil {
		return nil
	}

	if oldFr.Model() != newFr.Model() || oldFr.Schema() != newFr.Schema() {
		return interfaces.ErrReferenceModelChanged
	}

	rs := s
	if s.ID() != newFr.Schema() {
		s, err := i.repos.Schema.FindByID(ctx, newFr.Schema())
		if err != nil {
			return err
		}
		rs = s
	}

	rf := rs.Field(*oldFr.CorrespondingFieldID())
	if rf == nil {
		return interfaces.ErrFieldNotFound
	}
	if err := updateField(interfaces.UpdateFieldParam{
		ModelID:     newFr.Model().Ref(),
		SchemaID:    newFr.Schema(),
		FieldID:     *oldFr.CorrespondingFieldID(),
		Name:        &newFr.CorrespondingField().Title,
		Description: &newFr.CorrespondingField().Description,
		Key:         &newFr.CorrespondingField().Key,
		Required:    &newFr.CorrespondingField().Required,
	}, rf); err != nil {
		return err
	}
	if err := i.repos.Schema.Save(ctx, rs); err != nil {
		return err
	}

	return nil
}

func (i Schema) DeleteField(ctx context.Context, schemaId id.SchemaID, fieldID id.FieldID, operator *usecase.Operator) error {
	return Run0(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) error {
			s, err := i.repos.Schema.FindByID(ctx, schemaId)
			if err != nil {
				return err
			}

			if !operator.IsMaintainingProject(s.Project()) {
				return interfaces.ErrOperationDenied
			}

			f := s.Field(fieldID)
			if f == nil {
				return interfaces.ErrFieldNotFound
			}
			if f.Type() == value.TypeReference {
				err := i.deleteCorrespondingField(ctx, s, f)
				if err != nil {
					return err
				}
			}

			s.RemoveField(fieldID)
			return i.repos.Schema.Save(ctx, s)
		})
}

func (i Schema) deleteCorrespondingField(ctx context.Context, s *schema.Schema, f *schema.Field) error {
	fr, _ := schema.FieldReferenceFromTypeProperty(f.TypeProperty())
	if fr.CorrespondingFieldID() == nil {
		return nil
	}

	rs := s
	if s.ID() != fr.Schema() {
		s, err := i.repos.Schema.FindByID(ctx, fr.Schema())
		if err != nil {
			return err
		}
		rs = s
	}

	rs.RemoveField(*fr.CorrespondingFieldID())
	if err := i.repos.Schema.Save(ctx, rs); err != nil {
		return err
	}

	return nil
}

func (i Schema) UpdateFields(ctx context.Context, sid id.SchemaID, params []interfaces.UpdateFieldParam, operator *usecase.Operator) (schema.FieldList, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (schema.FieldList, error) {
		s, err := i.repos.Schema.FindByID(ctx, sid)
		if err != nil {
			return nil, err
		}
		if !operator.IsMaintainingProject(s.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		for _, param := range params {
			f := s.Field(param.FieldID)
			if f == nil {
				return nil, interfaces.ErrFieldNotFound
			}
			err = updateField(param, f)
			if err != nil {
				return nil, err
			}
		}
		if err := i.repos.Schema.Save(ctx, s); err != nil {
			return nil, err
		}

		return nil, nil
	})
}

func updateField(param interfaces.UpdateFieldParam, f *schema.Field) error {
	if param.Multiple != nil {
		f.SetMultiple(*param.Multiple)
	}

	if param.TypeProperty != nil {
		if param.DefaultValue != nil {
			_ = f.SetDefaultValue(nil)
		}
		if err := f.SetTypeProperty(param.TypeProperty); err != nil {
			return err
		}
	}

	if param.DefaultValue != nil {
		if err := f.SetDefaultValue(param.DefaultValue); err != nil {
			return err
		}
	}

	if param.Key != nil {
		if err := f.SetKey(key.New(*param.Key)); err != nil {
			return err
		}
	}

	if param.Name != nil {
		f.SetName(*param.Name)
	}

	if param.Description != nil {
		f.SetDescription(*param.Description)
	}

	if param.Order != nil {
		f.SetOrder(*param.Order)
	}

	if param.Required != nil {
		f.SetRequired(*param.Required)
	}

	if param.Unique != nil {
		f.SetUnique(*param.Unique)
	}

	return nil
}

func (i Schema) GetSchemasAndGroupSchemasByIDs(ctx context.Context, list id.SchemaIDList, _ *usecase.Operator) (schemas schema.List, groupSchemas schema.List, err error) {
	schemas, err = i.repos.Schema.FindByIDs(ctx, list)
	if err != nil {
		return
	}
	var gIds id.GroupIDList
	for _, s := range schemas {
		sg := lo.Filter(s.Fields(), func(f *schema.Field, _ int) bool {
			return f.Type() == value.TypeGroup
		})
		gIds = lo.Map(sg, func(sf *schema.Field, _ int) id.GroupID {
			var g id.GroupID
			sf.TypeProperty().Match(schema.TypePropertyMatch{
				Group: func(f *schema.FieldGroup) {
					g = f.Group()
				},
			})
			return g
		})
	}
	groups, err1 := i.repos.Group.FindByIDs(ctx, gIds)
	if err1 != nil {
		return nil, nil, err1
	}

	gsl, err1 := i.repos.Schema.FindByIDs(ctx, groups.SchemaIDs())
	if err1 != nil {
		return nil, nil, err1
	}
	groupSchemas = append(groupSchemas, gsl...)
	return
}
