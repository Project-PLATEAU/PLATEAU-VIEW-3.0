package gqlmodel

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToItem(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	uid := accountdomain.NewUserID()
	nid := id.NewIntegrationID()
	tid := id.NewThreadID()
	pid := id.NewProjectID()
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	sf := []*schema.Field{sf1}
	s := schema.New().ID(sid).Fields(sf).Workspace(accountdomain.NewWorkspaceID()).TitleField(sf1.ID().Ref()).Project(pid).MustBuild()
	i := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{item.NewField(sf1.ID(), value.TypeText.Value("test").AsMultiple(), nil)}).
		Model(mid).
		Thread(tid).
		User(uid).
		Integration(nid).
		MustBuild()
	v := version.New()

	vi := version.MustBeValue(v, nil, version.NewRefs(version.Latest), util.Now(), i)
	tests := []struct {
		name  string
		input item.Versioned
		want  *Item
	}{
		{
			name:  "should return a gql model item",
			input: vi,
			want: &Item{
				ID:            IDFrom(iid),
				ProjectID:     IDFrom(pid),
				ModelID:       IDFrom(mid),
				SchemaID:      IDFrom(sid),
				ThreadID:      IDFrom(tid),
				UserID:        IDFromRef(uid.Ref()),
				IntegrationID: IDFromRef(nid.Ref()),
				CreatedAt:     i.ID().Timestamp(),
				UpdatedAt:     i.Timestamp(),
				Fields: []*ItemField{
					{
						SchemaFieldID: IDFrom(sf1.ID()),
						Type:          SchemaFieldTypeText,
						Value:         "test",
					},
				},
				Version: v.String(),
				Title:   lo.ToPtr("test"),
			},
		},
		{
			name: "should return nil",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got := ToItem(tc.input, s, nil)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestToItemParam(t *testing.T) {
	sfid := id.NewFieldID()
	tests := []struct {
		name  string
		input *ItemFieldInput
		want  *interfaces.ItemFieldParam
	}{
		{
			name: "should return ItemFieldParam",
			input: &ItemFieldInput{
				SchemaFieldID: IDFrom(sfid),
				Type:          SchemaFieldTypeText,
				Value:         "foo",
			},
			want: &interfaces.ItemFieldParam{
				Field: &sfid,
				Type:  value.TypeText,
				Value: "foo",
			},
		},
		{
			name: "nil input",
		},
		{
			name: "invalid schema field ID",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := ToItemParam(tc.input)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestToVersionedItem(t *testing.T) {
	pId := id.NewProjectID()
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	ref := "a"
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	sf := []*schema.Field{sf1}
	s := schema.New().ID(sid).Fields(sf).Workspace(accountdomain.NewWorkspaceID()).Project(pId).MustBuild()
	fs := []*item.Field{item.NewField(sf1.ID(), value.TypeBool.Value(true).AsMultiple(), nil)}
	i := item.New().ID(iid).Schema(sid).Model(id.NewModelID()).Project(pId).Fields(fs).Thread(id.NewThreadID()).MustBuild()
	vx, vy := version.New(), version.New()
	vv := *version.NewValue(vx, version.NewVersions(vy), version.NewRefs("a"), time.Time{}, i)
	tests := []struct {
		name string
		args *version.Value[*item.Item]
		want *VersionedItem
	}{
		{
			name: "success",
			args: &vv,
			want: &VersionedItem{
				Version: vv.Version().String(),
				Parents: []string{vy.String()},
				Refs:    []string{ref},
				Value:   ToItem(&vv, s, nil),
			},
		},
		{
			name: "nil input",
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := ToVersionedItem(tc.args, s, nil)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestToItemQuery(t *testing.T) {
	pid := id.NewProjectID()
	mid := id.NewModelID()
	sid := id.NewSchemaID()
	str := "foo"
	tests := []struct {
		name  string
		input SearchItemInput
		want  *item.Query
	}{
		{
			name: "should pass",
			input: SearchItemInput{
				Query: &ItemQueryInput{
					Project: IDFrom(pid),
					Model:   IDFrom(mid),
					Schema:  IDFromRef(sid.Ref()),
					Q:       &str,
				},
			},
			want: item.NewQuery(pid, mid, sid.Ref(), str, nil),
		},
		{
			name: "invalid project id",
			input: SearchItemInput{
				Query: &ItemQueryInput{
					Q:     &str,
					Model: IDFrom(mid),
				},
			},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			tc := tc
			t.Parallel()
			got := ToItemQuery(tc.input)
			assert.Equal(t, tc.want, got)
		})
	}
}
