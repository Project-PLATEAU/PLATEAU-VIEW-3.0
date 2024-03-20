package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToSchema(t *testing.T) {
	wId := accountdomain.NewWorkspaceID()
	pId := id.NewProjectID()
	sId := schema.NewID()
	fId := id.NewFieldID()
	k := key.Random()
	tests := []struct {
		name   string
		schema *schema.Schema
		want   *Schema
	}{
		{
			name:   "nil",
			schema: nil,
			want:   nil,
		},
		{
			name:   "success",
			schema: schema.New().ID(sId).Workspace(wId).Fields(nil).Project(pId).MustBuild(),
			want: &Schema{
				ID:        IDFrom(sId),
				ProjectID: IDFrom(pId),
				Fields:    []*SchemaField{},
			},
		},
		{
			name: "success",
			schema: schema.New().ID(sId).Workspace(wId).Project(pId).Fields([]*schema.Field{
				schema.NewField(schema.NewText(nil).TypeProperty()).ID(fId).Key(k).MustBuild(),
			}).MustBuild(),
			want: &Schema{
				ID:        IDFrom(sId),
				ProjectID: IDFrom(pId),
				Fields: []*SchemaField{{
					ID:          IDFrom(fId),
					Type:        "Text",
					Description: lo.ToPtr(""),
					Order:       lo.ToPtr(0),
					TypeProperty: &SchemaFieldText{
						DefaultValue: nil,
						MaxLength:    nil,
					},
					Key:       k.String(),
					CreatedAt: fId.Timestamp(),
					UpdatedAt: fId.Timestamp(),
				}},
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := ToSchema(tt.schema)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestToSchemaField(t *testing.T) {
	fid := schema.NewFieldID()
	tests := []struct {
		name   string
		schema *schema.Field
		want   *SchemaField
	}{
		{
			name:   "nil",
			schema: nil,
			want:   nil,
		},
		{
			name: "success",
			schema: schema.NewField(schema.NewText(nil).TypeProperty()).
				ID(fid).
				UpdatedAt(fid.Timestamp()).
				Name("N1").
				Description("D1").
				Key(key.New("K123456")).
				Unique(true).
				Multiple(true).
				Required(true).
				MustBuild(),
			want: &SchemaField{
				ID:           IDFrom(fid),
				ModelID:      nil,
				Model:        nil,
				Type:         SchemaFieldTypeText,
				TypeProperty: &SchemaFieldText{},
				Key:          "K123456",
				Title:        "N1",
				Description:  lo.ToPtr("D1"),
				Multiple:     true,
				Unique:       true,
				Order:        lo.ToPtr(0),
				Required:     true,
				IsTitle:      true,
				CreatedAt:    fid.Timestamp(),
				UpdatedAt:    fid.Timestamp(),
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := ToSchemaField(tt.schema, fid.Ref())
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestToSchemaFieldTypeProperty(t *testing.T) {
	mid := id.NewModelID()
	sid := id.NewSchemaID()

	type args struct {
		tp *schema.TypeProperty
		dv *value.Multiple
	}
	tests := []struct {
		name string
		args args
		want SchemaFieldTypeProperty
	}{
		{
			name: "nil",
			args: args{tp: nil},
			want: nil,
		},
		{
			name: "text",
			args: args{tp: schema.NewText(nil).TypeProperty()},
			want: &SchemaFieldText{DefaultValue: nil, MaxLength: nil},
		},
		{
			name: "text area",
			args: args{tp: schema.NewTextArea(nil).TypeProperty()},
			want: &SchemaFieldTextArea{DefaultValue: nil, MaxLength: nil},
		},
		{
			name: "rich text",
			args: args{tp: schema.NewRichText(nil).TypeProperty()},
			want: &SchemaFieldRichText{DefaultValue: nil, MaxLength: nil},
		},
		{
			name: "markdown",
			args: args{tp: schema.NewMarkdown(nil).TypeProperty()},
			want: &SchemaFieldMarkdown{DefaultValue: nil, MaxLength: nil},
		},
		{
			name: "bool",
			args: args{tp: schema.NewBool().TypeProperty()},
			want: &SchemaFieldBool{DefaultValue: nil},
		},
		{
			name: "checkbox",
			args: args{tp: schema.NewCheckbox().TypeProperty()},
			want: &SchemaFieldCheckbox{DefaultValue: nil},
		},
		{
			name: "datetime",
			args: args{tp: schema.NewDateTime().TypeProperty()},
			want: &SchemaFieldDate{DefaultValue: nil},
		},
		{
			name: "reference",
			args: args{tp: schema.NewReference(mid, sid, nil, nil).TypeProperty()},
			want: &SchemaFieldReference{ModelID: IDFrom(mid), SchemaID: IDFrom(sid)},
		},
		{
			name: "asset",
			args: args{tp: schema.NewAsset().TypeProperty()},
			want: &SchemaFieldAsset{DefaultValue: nil},
		},
		{
			name: "integer",
			args: args{tp: lo.Must(schema.NewInteger(nil, nil)).TypeProperty()},
			want: &SchemaFieldInteger{DefaultValue: nil, Min: nil, Max: nil},
		},
		{
			name: "url",
			args: args{tp: schema.NewURL().TypeProperty()},
			want: &SchemaFieldURL{DefaultValue: nil},
		},
		{
			name: "url",
			args: args{tp: schema.NewURL().TypeProperty(), dv: value.New(value.TypeURL, "https://hogo.com").AsMultiple()},
			want: &SchemaFieldURL{DefaultValue: "https://hogo.com"},
		},
		{
			name: "select",
			args: args{tp: schema.NewSelect([]string{"v1"}).TypeProperty()},
			want: &SchemaFieldSelect{Values: []string{"v1"}, DefaultValue: nil},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, ToSchemaFieldTypeProperty(tt.args.tp, tt.args.dv, false))
		})
	}
}

func TestFromSchemaFieldTypeProperty(t *testing.T) {
	mid := id.NewModelID()
	sid := id.NewSchemaID()

	tests := []struct {
		name      string
		argsInp   *SchemaFieldTypePropertyInput
		argsT     SchemaFieldType
		wantTp    *schema.TypeProperty
		wantDv    *value.Multiple
		wantError error
	}{
		{
			name:      "empty value",
			argsInp:   &SchemaFieldTypePropertyInput{},
			wantError: ErrInvalidTypeProperty,
		},
		{
			name: "text",
			argsInp: &SchemaFieldTypePropertyInput{
				Text: &SchemaFieldTextInput{DefaultValue: nil, MaxLength: nil},
			},
			argsT:  SchemaFieldTypeText,
			wantTp: schema.NewText(nil).TypeProperty(),
		},
		{
			name: "text area",
			argsInp: &SchemaFieldTypePropertyInput{
				TextArea: &SchemaFieldTextAreaInput{DefaultValue: nil, MaxLength: nil},
			},
			argsT:  SchemaFieldTypeTextArea,
			wantTp: schema.NewTextArea(nil).TypeProperty(),
		},
		{
			name: "rich text",
			argsInp: &SchemaFieldTypePropertyInput{
				RichText: &SchemaFieldRichTextInput{DefaultValue: nil, MaxLength: nil},
			},
			argsT:  SchemaFieldTypeRichText,
			wantTp: schema.NewRichText(nil).TypeProperty(),
		},
		{
			name: "markdown",
			argsInp: &SchemaFieldTypePropertyInput{
				MarkdownText: &SchemaMarkdownTextInput{DefaultValue: nil, MaxLength: nil},
			},
			argsT:  SchemaFieldTypeMarkdownText,
			wantTp: schema.NewMarkdown(nil).TypeProperty(),
		},
		{
			name: "bool",
			argsInp: &SchemaFieldTypePropertyInput{
				Bool: &SchemaFieldBoolInput{DefaultValue: nil},
			},
			argsT:  SchemaFieldTypeBool,
			wantTp: schema.NewBool().TypeProperty(),
		},
		{
			name: "datetime",
			argsInp: &SchemaFieldTypePropertyInput{
				Date: &SchemaFieldDateInput{
					DefaultValue: nil,
				},
			},
			argsT:  SchemaFieldTypeDate,
			wantTp: schema.NewDateTime().TypeProperty(),
		},
		{
			name: "reference",
			argsInp: &SchemaFieldTypePropertyInput{
				Reference: &SchemaFieldReferenceInput{
					ModelID:  ID(mid.String()),
					SchemaID: ID(sid.String()),
				},
			},
			argsT:  SchemaFieldTypeReference,
			wantTp: schema.NewReference(mid, sid, nil, nil).TypeProperty(),
		},
		{
			name: "asset",
			argsInp: &SchemaFieldTypePropertyInput{
				Asset: &SchemaFieldAssetInput{DefaultValue: nil},
			},
			argsT:  SchemaFieldTypeAsset,
			wantTp: schema.NewAsset().TypeProperty(),
		},
		{
			name: "integer",
			argsInp: &SchemaFieldTypePropertyInput{
				Integer: &SchemaFieldIntegerInput{},
			},
			argsT:  SchemaFieldTypeInteger,
			wantTp: lo.Must(schema.NewInteger(nil, nil)).TypeProperty(),
		},
		{
			name: "url",
			argsInp: &SchemaFieldTypePropertyInput{
				URL: &SchemaFieldURLInput{DefaultValue: nil},
			},
			argsT:  SchemaFieldTypeURL,
			wantTp: schema.NewURL().TypeProperty(),
		},
		{
			name: "select",
			argsInp: &SchemaFieldTypePropertyInput{
				Select: &SchemaFieldSelectInput{Values: []string{""}},
			},
			argsT:     SchemaFieldTypeSelect,
			wantError: ErrEmptyOptions,
		},
		{
			name: "tags empty",
			argsInp: &SchemaFieldTypePropertyInput{
				Tag: &SchemaFieldTagInput{
					Tags:         []*SchemaFieldTagValueInput{},
					DefaultValue: nil,
				},
			},
			argsT:     SchemaFieldTypeTag,
			wantError: ErrEmptyOptions,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			tp, dv, err := FromSchemaTypeProperty(tt.argsInp, tt.argsT, false)
			assert.Equal(t, tt.wantTp, tp)
			assert.Equal(t, tt.wantDv, dv)
			assert.Equal(t, tt.wantError, err)
		})
	}
}

func TestFromCorrespondingField(t *testing.T) {
	var cf *CorrespondingFieldInput
	got := FromCorrespondingField(cf)
	assert.Nil(t, got)

	cf = &CorrespondingFieldInput{
		FieldID:     IDFromRef(id.NewFieldID().Ref()),
		Title:       "title",
		Key:         "key",
		Description: "",
		Required:    false,
	}
	want := &schema.CorrespondingField{
		Title:       cf.Title,
		Key:         cf.Key,
		Description: cf.Description,
		Required:    cf.Required,
	}
	got = FromCorrespondingField(cf)
	assert.Equal(t, want, got)
}
