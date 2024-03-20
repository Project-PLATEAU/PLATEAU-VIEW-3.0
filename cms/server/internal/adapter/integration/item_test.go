package integration

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_convertMetaFields(t *testing.T) {
	type args struct {
		fields []integrationapi.Field
		s      *schema.Package
	}
	tag1 := schema.NewTag("xyz", schema.TagColorVolcano)
	tag2 := schema.NewTag("日本語", schema.TagColorOrange)
	tf, _ := schema.NewFieldTag(schema.TagList{tag1, tag2})

	sf1 := schema.NewField(tf.TypeProperty()).NewID().Key(key.New("sf-1")).MustBuild()
	sf2 := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(key.New("sf-1")).MustBuild()
	var vi any = "日本語"
	var vi2 any = "xyz"
	s := schema.New().NewID().Fields(schema.FieldList{sf1, sf2}).Project(id.NewProjectID()).Workspace(accountdomain.NewWorkspaceID()).MustBuild()
	sp := schema.NewPackage(s, nil, nil, nil)

	tests := []struct {
		name string
		args args
		want []interfaces.ItemFieldParam
	}{
		{
			name: "test japanese tag",
			args: args{
				fields: []integrationapi.Field{{
					Id:    sf1.ID().Ref(),
					Key:   lo.ToPtr(sf1.Key().String()),
					Type:  lo.ToPtr(integrationapi.ValueTypeTag),
					Value: lo.ToPtr(vi),
				}},
				s: sp,
			},
			want: []interfaces.ItemFieldParam{
				{
					Field: sf1.ID().Ref(),
					Key:   sf1.Key().Ref(),
					Type:  value.TypeTag,
					Value: tag2.ID(),
				},
			},
		},
		{
			name: "test all",
			args: args{
				fields: []integrationapi.Field{
					{
						Key:   lo.ToPtr(sf1.Key().String()),
						Value: lo.ToPtr(vi2),
					},
					{
						Key:   lo.ToPtr(sf2.Key().String()),
						Value: lo.ToPtr(any("xxx")),
					},
				},
				s: sp,
			},
			want: []interfaces.ItemFieldParam{
				{
					Key:   sf1.Key().Ref(),
					Type:  value.TypeTag,
					Value: tag1.ID(),
				},
				{
					Key:   sf2.Key().Ref(),
					Type:  value.TypeTag,
					Value: "xxx",
				},
			},
		},
	}
	for _, tt := range tests {
		assert.Equal(t, tt.want, convertFields(&tt.args.fields, tt.args.s, true, false))
	}
}
