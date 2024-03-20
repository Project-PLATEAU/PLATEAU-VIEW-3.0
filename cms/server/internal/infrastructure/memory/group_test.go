package memory

import (
	"context"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestGroupRepo_Filtered(t *testing.T) {
	r := &Group{}
	pid := id.NewProjectID()

	assert.Equal(t, &Group{
		f: repo.ProjectFilter{
			Readable: id.ProjectIDList{pid},
			Writable: nil,
		},
		now: &util.TimeNow{},
	}, r.Filtered(repo.ProjectFilter{
		Readable: id.ProjectIDList{pid},
		Writable: nil,
	}))
}

func TestGroupRepo_FindByID(t *testing.T) {

	pid1 := id.NewProjectID()
	id1 := id.NewGroupID()
	sid1 := id.NewSchemaID()
	k := key.New("T123456")
	m1 := group.New().ID(id1).Project(pid1).Schema(sid1).Key(k).MustBuild()

	tests := []struct {
		name    string
		seeds   group.List
		arg     id.GroupID
		filter  *repo.ProjectFilter
		want    *group.Group
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   group.List{},
			arg:     id.NewGroupID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: group.List{
				group.New().NewID().Project(pid1).Schema(sid1).Key(k).MustBuild(),
			},
			arg:     id.NewGroupID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: group.List{
				m1,
			},
			arg:     id1,
			want:    m1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: group.List{
				m1,
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			arg:     id1,
			want:    m1,
			wantErr: nil,
		},
		{
			name: "project filter operation success",
			seeds: group.List{
				m1,
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{pid1}, Writable: []id.ProjectID{pid1}},
			want:    m1,
			wantErr: nil,
		},
		{
			name: "project filter operation denied",
			seeds: group.List{
				m1,
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{}, Writable: []id.ProjectID{}},
			want:    nil,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewGroup()
			ctx := context.Background()

			for _, a := range tc.seeds {
				err := r.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByID(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestGroupRepo_FindByIDs(t *testing.T) {

	pid1 := id.NewProjectID()
	id1 := id.NewGroupID()
	id2 := id.NewGroupID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	k := key.New("T123456")
	m1 := group.New().ID(id1).Project(pid1).Schema(sid1).Key(k).MustBuild()
	m2 := group.New().ID(id2).Project(pid1).Schema(sid2).Key(k).MustBuild()

	tests := []struct {
		name    string
		seeds   group.List
		arg     id.GroupIDList
		filter  *repo.ProjectFilter
		want    group.List
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   group.List{},
			arg:     id.GroupIDList{},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with group for another workspaces",
			seeds: group.List{
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			arg:     id.GroupIDList{},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single group",
			seeds: group.List{
				m1,
			},
			arg:     id.GroupIDList{id1},
			want:    group.List{m1},
			wantErr: nil,
		},
		{
			name: "1 count with multi groups",
			seeds: group.List{
				m1,
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			arg:     id.GroupIDList{id1},
			want:    group.List{m1},
			wantErr: nil,
		},
		{
			name: "2 count with multi groups",
			seeds: group.List{
				m1,
				m2,
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			arg:     id.GroupIDList{id1, id2},
			want:    group.List{m1, m2},
			wantErr: nil,
		},
		{
			name: "project filter operation success",
			seeds: group.List{
				m1,
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			arg:     id.GroupIDList{id1},
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{pid1}, Writable: []id.ProjectID{pid1}},
			want:    group.List{m1},
			wantErr: nil,
		},
		{
			name: "project filter operation denied",
			seeds: group.List{
				m1,
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			arg:     id.GroupIDList{id1},
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{}, Writable: []id.ProjectID{}},
			want:    nil,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewGroup()

			ctx := context.Background()
			for _, a := range tc.seeds {
				err := r.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByIDs(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, tc.want, got)
		})
	}
}

func TestGroupRepo_FindByProject(t *testing.T) {
	pid1 := id.NewProjectID()
	id1 := id.NewGroupID()
	id2 := id.NewGroupID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	k := key.New("T123456")
	m1 := group.New().ID(id1).Project(pid1).Schema(sid1).Key(k).MustBuild()
	m2 := group.New().ID(id2).Project(pid1).Schema(sid2).Key(k).MustBuild()

	type args struct {
		tid id.ProjectID
	}
	tests := []struct {
		name    string
		seeds   group.List
		args    args
		filter  *repo.ProjectFilter
		want    group.List
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   group.List{},
			args:    args{id.NewProjectID()},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with group for another projects",
			seeds: group.List{
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			args:    args{id.NewProjectID()},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single group",
			seeds: group.List{
				m1,
			},
			args:    args{pid1},
			want:    group.List{m1},
			wantErr: nil,
		},
		{
			name: "1 count with multi groups",
			seeds: group.List{
				m1,
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			args:    args{pid1},
			want:    group.List{m1},
			wantErr: nil,
		},
		{
			name: "2 count with multi groups",
			seeds: group.List{
				m1,
				m2,
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			args:    args{pid1},
			want:    group.List{m1, m2},
			wantErr: nil,
		},
		{
			name: "project filter operation success",
			seeds: group.List{
				m1,
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			args:    args{pid1},
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{pid1}, Writable: []id.ProjectID{pid1}},
			want:    group.List{m1},
			wantErr: nil,
		},
		{
			name: "project filter operation denied",
			seeds: group.List{
				m1,
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
				group.New().NewID().Project(id.NewProjectID()).Schema(sid1).Key(k).MustBuild(),
			},
			args:    args{pid1},
			filter:  &repo.ProjectFilter{Readable: []id.ProjectID{}, Writable: []id.ProjectID{}},
			want:    nil,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewGroup()

			ctx := context.Background()
			for _, a := range tc.seeds {
				err := r.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByProject(ctx, tc.args.tid)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, tc.want, got)
		})
	}
}
