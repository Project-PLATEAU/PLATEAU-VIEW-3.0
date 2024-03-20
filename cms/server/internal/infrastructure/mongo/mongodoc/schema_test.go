package mongodoc

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/samber/lo"

	"github.com/stretchr/testify/assert"
)

func TestNewSchema(t *testing.T) {
	sId, wId, PId := schema.NewID(), user.NewWorkspaceID(), project.NewID()
	tests := []struct {
		name   string
		s      *schema.Schema
		want   *SchemaDocument
		sDocId string
	}{
		{
			name: "new",
			s:    schema.New().ID(sId).Workspace(wId).Project(PId).MustBuild(),
			want: &SchemaDocument{
				ID:        sId.String(),
				Workspace: wId.String(),
				Project:   PId.String(),
				Fields:    nil,
			},
			sDocId: sId.String(),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, sDocId := NewSchema(tt.s)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.sDocId, sDocId)
		})
	}
}

func TestNewSchemaConsumer(t *testing.T) {
	c := NewSchemaConsumer()
	assert.NotNil(t, c)
}

func TestSchemaDocument_Model(t *testing.T) {
	sId, wId, PId := schema.NewID(), user.NewWorkspaceID(), project.NewID()
	fid := schema.NewFieldID()
	key := id.NewKey("test")
	max := lo.ToPtr(10)
	fd := FieldDocument{
		ID:           fid.String(),
		Name:         "test",
		Description:  "",
		Order:        0,
		Key:          key.String(),
		Unique:       true,
		Multiple:     true,
		Required:     true,
		DefaultValue: nil,
		TypeProperty: TypePropertyDocument{
			Type: "text",
			Text: &FieldTextPropertyDocument{
				MaxLength: max,
			},
		},
	}
	sf := schema.NewField(schema.NewText(max).TypeProperty()).ID(fid).Name("test").Description("").Order(0).Key(id.NewKey("test")).Unique(true).Multiple(true).Required(true).DefaultValue(nil).MustBuild()

	tests := []struct {
		name    string
		sDoc    *SchemaDocument
		want    *schema.Schema
		wantErr bool
	}{
		{
			name: "model",
			sDoc: &SchemaDocument{
				ID:         sId.String(),
				Workspace:  wId.String(),
				Project:    PId.String(),
				Fields:     []FieldDocument{fd},
				TitleField: fid.StringRef(),
			},
			want:    schema.New().ID(sId).Workspace(wId).Project(PId).Fields(schema.FieldList{sf}).TitleField(fid.Ref()).MustBuild(),
			wantErr: false,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.sDoc.Model()
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}
