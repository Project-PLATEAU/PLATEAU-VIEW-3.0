package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type SchemaDocument struct {
	ID         string
	Workspace  string
	Project    string
	Fields     []FieldDocument
	TitleField *string
}

type FieldDocument struct {
	ID           string
	Name         string
	Description  string
	Order        int
	Key          string
	Unique       bool
	Multiple     bool
	Required     bool
	UpdatedAt    time.Time
	DefaultValue *ValueDocument
	TypeProperty TypePropertyDocument
}

type TypePropertyDocument struct {
	Type      string
	Text      *FieldTextPropertyDocument      `bson:",omitempty"`
	TextArea  *FieldTextPropertyDocument      `bson:",omitempty"`
	RichText  *FieldTextPropertyDocument      `bson:",omitempty"`
	Markdown  *FieldTextPropertyDocument      `bson:",omitempty"`
	Select    *FieldSelectPropertyDocument    `bson:",omitempty"`
	Tag       *FieldTagPropertyDocument       `bson:",omitempty"`
	Number    *FieldNumberPropertyDocument    `bson:",omitempty"`
	Integer   *FieldIntegerPropertyDocument   `bson:",omitempty"`
	Reference *FieldReferencePropertyDocument `bson:",omitempty"`
	Group     *FieldGroupPropertyDocument     `bson:",omitempty"`
}

type FieldTextPropertyDocument struct {
	MaxLength *int
}
type FieldSelectPropertyDocument struct {
	Values []string
}

type FieldTagValueDocument struct {
	ID    string
	Name  string
	Color string
}

type FieldTagPropertyDocument struct {
	Tags []FieldTagValueDocument
}

type FieldNumberPropertyDocument struct {
	Min *float64
	Max *float64
}

type FieldIntegerPropertyDocument struct {
	Min *int64
	Max *int64
}

type FieldReferencePropertyDocument struct {
	Model              string
	Schema             string
	CorrespondingField *string
}

type FieldGroupPropertyDocument struct {
	Group string
}

func NewSchema(s *schema.Schema) (*SchemaDocument, string) {
	sId := s.ID().String()
	fieldsDoc := util.Map(s.Fields(), func(f *schema.Field) FieldDocument {
		fd := FieldDocument{
			ID:          f.ID().String(),
			Name:        f.Name(),
			Description: f.Description(),
			Order:       f.Order(),
			Key:         f.Key().String(),
			Unique:      f.Unique(),
			Multiple:    f.Multiple(),
			Required:    f.Required(),
			UpdatedAt:   f.UpdatedAt(),
			TypeProperty: TypePropertyDocument{
				Type: string(f.Type()),
			},
		}

		if len(f.DefaultValue().Values()) > 0 && !f.DefaultValue().First().IsEmpty() {
			fd.DefaultValue = NewMultipleValue(f.DefaultValue())
		}

		f.TypeProperty().Match(schema.TypePropertyMatch{
			Text: func(fp *schema.FieldText) {
				fd.TypeProperty.Text = &FieldTextPropertyDocument{
					MaxLength: fp.MaxLength(),
				}
			},
			TextArea: func(fp *schema.FieldTextArea) {
				fd.TypeProperty.TextArea = &FieldTextPropertyDocument{
					MaxLength: fp.MaxLength(),
				}
			},
			RichText: func(fp *schema.FieldRichText) {
				fd.TypeProperty.RichText = &FieldTextPropertyDocument{
					MaxLength: fp.MaxLength(),
				}
			},
			Markdown: func(fp *schema.FieldMarkdown) {
				fd.TypeProperty.Markdown = &FieldTextPropertyDocument{
					MaxLength: fp.MaxLength(),
				}
			},
			Asset:    func(fp *schema.FieldAsset) {},
			DateTime: func(fp *schema.FieldDateTime) {},
			Bool:     func(fp *schema.FieldBool) {},
			Checkbox: func(fp *schema.FieldCheckbox) {},
			Select: func(fp *schema.FieldSelect) {
				fd.TypeProperty.Select = &FieldSelectPropertyDocument{
					Values: fp.Values(),
				}
			},
			Tag: func(fp *schema.FieldTag) {
				tags := lo.Map(fp.Tags(), func(item *schema.Tag, _ int) FieldTagValueDocument {
					return FieldTagValueDocument{
						ID:    item.ID().String(),
						Name:  item.Name(),
						Color: item.Color().String(),
					}
				})
				fd.TypeProperty.Tag = &FieldTagPropertyDocument{
					Tags: tags,
				}
			},
			Number: func(fp *schema.FieldNumber) {
				fd.TypeProperty.Number = &FieldNumberPropertyDocument{
					Min: fp.Min(),
					Max: fp.Max(),
				}
			},
			Integer: func(fp *schema.FieldInteger) {
				fd.TypeProperty.Integer = &FieldIntegerPropertyDocument{
					Min: fp.Min(),
					Max: fp.Max(),
				}
			},
			Reference: func(fp *schema.FieldReference) {
				fd.TypeProperty.Reference = &FieldReferencePropertyDocument{
					Model:              fp.Model().String(),
					Schema:             fp.Schema().String(),
					CorrespondingField: fp.CorrespondingFieldID().StringRef(),
				}
			},
			Group: func(fp *schema.FieldGroup) {
				fd.TypeProperty.Group = &FieldGroupPropertyDocument{
					Group: fp.Group().String(),
				}
			},
			URL: func(fp *schema.FieldURL) {},
		})
		return fd
	})
	return &SchemaDocument{
		ID:         sId,
		Workspace:  s.Workspace().String(),
		Project:    s.Project().String(),
		Fields:     fieldsDoc,
		TitleField: s.TitleField().StringRef(),
	}, sId
}

func (d *SchemaDocument) Model() (*schema.Schema, error) {
	sId, err := id.SchemaIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	wId, err := accountdomain.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}
	pId, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}
	fid := id.FieldIDFromRef(d.TitleField)

	f, err := util.TryMap(d.Fields, func(fd FieldDocument) (*schema.Field, error) {
		tpd := fd.TypeProperty
		var tags schema.TagList
		if tpd.Tag != nil {
			tags, err = util.TryMap(tpd.Tag.Tags, func(tag FieldTagValueDocument) (*schema.Tag, error) {
				tid, err := id.TagIDFrom(tag.ID)
				if err != nil {
					return nil, err
				}
				return schema.NewTagWithID(tid, tag.Name, schema.TagColorFrom(tag.Color))
			})
			if err != nil {
				return nil, err
			}
		}
		var gid id.GroupID
		if tpd.Group != nil {
			gid, err = id.GroupIDFrom(tpd.Group.Group)
			if err != nil {
				return nil, err
			}
		}

		var tp *schema.TypeProperty
		switch value.Type(tpd.Type) {
		case value.TypeText:
			tp = schema.NewText(tpd.Text.MaxLength).TypeProperty()
		case value.TypeTextArea:
			tp = schema.NewTextArea(tpd.TextArea.MaxLength).TypeProperty()
		case value.TypeRichText:
			tp = schema.NewRichText(tpd.RichText.MaxLength).TypeProperty()
		case value.TypeMarkdown:
			tp = schema.NewMarkdown(tpd.Markdown.MaxLength).TypeProperty()
		case value.TypeAsset:
			tp = schema.NewAsset().TypeProperty()
		case value.TypeDateTime:
			tp = schema.NewDateTime().TypeProperty()
		case value.TypeBool:
			tp = schema.NewBool().TypeProperty()
		case value.TypeCheckbox:
			tp = schema.NewCheckbox().TypeProperty()
		case value.TypeSelect:
			tp = schema.NewSelect(tpd.Select.Values).TypeProperty()
		case value.TypeTag:
			tag, err := schema.NewFieldTag(tags)
			if err != nil {
				return nil, err
			}
			tp = tag.TypeProperty()
		case value.TypeNumber:
			tpi, err := schema.NewNumber(tpd.Number.Min, tpd.Number.Max)
			if err != nil {
				return nil, err
			}
			tp = tpi.TypeProperty()
		case value.TypeInteger:
			tpi, err := schema.NewInteger(tpd.Integer.Min, tpd.Integer.Max)
			if err != nil {
				return nil, err
			}
			tp = tpi.TypeProperty()
		case value.TypeReference:
			mid, err := id.ModelIDFrom(tpd.Reference.Model)
			if err != nil {
				return nil, err
			}
			sid, err := id.SchemaIDFrom(tpd.Reference.Schema)
			if err != nil {
				return nil, err
			}
			var cfid *id.FieldID
			if tpd.Reference.CorrespondingField != nil {
				cfid = id.FieldIDFromRef(tpd.Reference.CorrespondingField)
			}
			tp = schema.NewReference(mid, sid, cfid, nil).TypeProperty()
		case value.TypeURL:
			tp = schema.NewURL().TypeProperty()
		case value.TypeGroup:
			tp = schema.NewGroup(gid).TypeProperty()
		}

		fid, err := id.FieldIDFrom(fd.ID)
		if err != nil {
			return nil, err
		}

		return schema.NewField(tp).
			ID(fid).
			Name(fd.Name).
			Unique(fd.Unique).
			Multiple(fd.Multiple).
			Order(fd.Order).
			Required(fd.Required).
			Description(fd.Description).
			Key(key.New(fd.Key)).
			UpdatedAt(fd.UpdatedAt).
			DefaultValue(fd.DefaultValue.MultipleValue()).
			Build()
	})
	if err != nil {
		return nil, err
	}

	return schema.New().
		ID(sId).
		Workspace(wId).
		Project(pId).
		Fields(f).
		TitleField(fid).
		Build()
}

type SchemaConsumer = mongox.SliceFuncConsumer[*SchemaDocument, *schema.Schema]

func NewSchemaConsumer() *SchemaConsumer {
	return NewConsumer[*SchemaDocument, *schema.Schema]()
}
