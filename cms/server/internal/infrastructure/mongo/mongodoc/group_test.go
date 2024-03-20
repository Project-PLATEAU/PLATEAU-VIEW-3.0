package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestGroupDocument_Group(t *testing.T) {
	mId, pId, sId := group.NewID(), project.NewID(), schema.NewID()
	tests := []struct {
		name    string
		mDoc    *GroupDocument
		want    *group.Group
		wantErr bool
	}{
		{
			name: "group",
			mDoc: &GroupDocument{
				ID:          mId.String(),
				Name:        "abc",
				Description: "xyz",
				Key:         "mmm123",
				Project:     pId.String(),
				Schema:      sId.String(),
			},
			want: group.New().ID(mId).
				Name("abc").
				Description("xyz").
				Key(key.New("mmm123")).
				Project(pId).
				Schema(sId).
				MustBuild(),
			wantErr: false,
		},
		{
			name: "Invalid id 1",
			mDoc: &GroupDocument{
				ID:          "abc",
				Name:        "abc",
				Description: "xyz",
				Key:         "mmm123",
				Project:     pId.String(),
				Schema:      sId.String(),
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "Invalid id 2",
			mDoc: &GroupDocument{
				ID:          mId.String(),
				Name:        "abc",
				Description: "xyz",
				Key:         "mmm123",
				Project:     "abc",
				Schema:      sId.String(),
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "Invalid id 3",
			mDoc: &GroupDocument{
				ID:          mId.String(),
				Name:        "abc",
				Description: "xyz",
				Key:         "mmm123",
				Project:     pId.String(),
				Schema:      "abc",
			},
			want:    nil,
			wantErr: true,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {

			got, err := tt.mDoc.Model()
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewGroup(t *testing.T) {
	mId, pId, sId := group.NewID(), project.NewID(), schema.NewID()
	tests := []struct {
		name   string
		args   *group.Group
		want   *GroupDocument
		wantId string
	}{
		{
			name: "",
			args: group.New().ID(mId).
				Name("abc").
				Description("xyz").
				Key(key.New("mmm123")).
				Project(pId).
				Schema(sId).
				MustBuild(),
			want: &GroupDocument{
				ID:          mId.String(),
				Name:        "abc",
				Description: "xyz",
				Key:         "mmm123",
				Project:     pId.String(),
				Schema:      sId.String(),
			},
			wantId: mId.String(),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			got, gotId := NewGroup(tt.args)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.wantId, gotId)
		})
	}
}

func TestNewGroupConsumer(t *testing.T) {
	c := NewGroupConsumer()
	assert.NotNil(t, c)
}
