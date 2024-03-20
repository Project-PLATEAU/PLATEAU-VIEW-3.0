package memory

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestViewRepo_FindByID(t *testing.T) {
	now := time.Now()
	iId1 := id.NewViewID()
	i1 := view.New().ID(iId1).UpdatedAt(now).MustBuild()

	tests := []struct {
		name    string
		seeds   view.List
		arg     view.ID
		want    *view.View
		wantErr error
		mockErr bool
	}{
		{
			name:    "Not found in empty db",
			seeds:   view.List{},
			arg:     view.NewID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "Not found",
			seeds:   view.List{i1},
			arg:     view.NewID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "Found 1",
			seeds:   view.List{i1},
			arg:     iId1,
			want:    i1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: view.List{
				view.New().NewID().UpdatedAt(now).MustBuild(),
				i1,
				view.New().NewID().UpdatedAt(now).MustBuild(),
			},
			arg:     iId1,
			want:    i1,
			wantErr: nil,
		},
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewView()
			if tc.mockErr {
				SetViewError(r, tc.wantErr)
			}
			defer MockViewNow(r, now)()
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}

			got, err := r.FindByID(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestViewRepo_FindByModelID(t *testing.T) {
	now := time.Now()
	iId1 := id.NewViewID()
	mID1 := id.NewModelID()
	i1 := view.New().ID(iId1).Model(mID1).UpdatedAt(now).MustBuild()
	i2 := view.New().NewID().Model(id.NewModelID()).UpdatedAt(now).MustBuild()

	tests := []struct {
		name    string
		seeds   view.List
		arg     view.ModelID
		want    view.List
		wantErr error
		mockErr bool
	}{
		{
			name:    "Not found in empty db",
			seeds:   view.List{},
			arg:     view.NewModelID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "Not found",
			seeds:   view.List{i1},
			arg:     id.NewModelID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "Found 1",
			seeds:   view.List{i1, i2},
			arg:     mID1,
			want:    view.List{i1},
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: view.List{
				view.New().NewID().UpdatedAt(now).MustBuild(),
				i1,
				view.New().NewID().UpdatedAt(now).MustBuild(),
			},
			arg:     mID1,
			want:    view.List{i1},
			wantErr: nil,
		},
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewView()
			if tc.mockErr {
				SetViewError(r, tc.wantErr)
			}
			defer MockViewNow(r, now)()
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}

			got, err := r.FindByModel(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestViewRepo_FindByIDs(t *testing.T) {
	now := time.Now()
	iId1 := id.NewViewID()
	iId2 := id.NewViewID()
	i1 := view.New().ID(iId1).UpdatedAt(now).MustBuild()
	i2 := view.New().ID(iId2).UpdatedAt(now).MustBuild()

	tests := []struct {
		name    string
		seeds   view.List
		arg     id.ViewIDList
		want    view.List
		wantErr error
		mockErr bool
	}{
		{
			name:    "0 count in empty db",
			seeds:   view.List{},
			arg:     id.ViewIDList{},
			want:    nil,
			wantErr: nil,
		},
		{
			name:    "0 count",
			seeds:   view.List{i1, i2},
			arg:     id.ViewIDList{},
			want:    nil,
			wantErr: nil,
		},
		{
			name:    "1 count with single",
			seeds:   view.List{i1, i2},
			arg:     id.ViewIDList{iId2},
			want:    view.List{i2},
			wantErr: nil,
		},
		{
			name:    "2 count with multi",
			seeds:   view.List{i1, i2},
			arg:     id.ViewIDList{iId1, iId2},
			want:    view.List{i1, i2},
			wantErr: nil,
		},
		{
			name:    "2 count with multi (reverse order)",
			seeds:   view.List{i1, i2},
			arg:     id.ViewIDList{iId2, iId1},
			want:    view.List{i1, i2},
			wantErr: nil,
		},
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewView()
			if tc.mockErr {
				SetViewError(r, tc.wantErr)
			}
			defer MockViewNow(r, now)()
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}

			got, err := r.FindByIDs(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestViewRepo_Save(t *testing.T) {
	now := time.Now()
	iId1 := view.NewID()
	i1 := view.New().ID(iId1).UpdatedAt(now).MustBuild()

	tests := []struct {
		name    string
		seeds   view.List
		arg     *view.View
		want    view.List
		wantErr error
		mockErr bool
	}{
		{
			name:    "Saved",
			seeds:   view.List{},
			arg:     i1,
			want:    view.List{i1},
			wantErr: nil,
		},
		{
			name:    "Saved same data",
			seeds:   view.List{i1},
			arg:     i1,
			want:    view.List{i1},
			wantErr: nil,
		},
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			arg:     i1,
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewView()
			if tc.mockErr {
				SetViewError(r, tc.wantErr)
			}
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
				if tc.wantErr != nil {
					assert.ErrorIs(t, err, tc.wantErr)
					return
				}
			}

			err := r.Save(ctx, tc.arg.Clone())
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, []*view.View(tc.want), r.(*View).data.Values())
		})
	}
}

func TestViewRepo_Remove(t *testing.T) {
	now := time.Now()
	iId1 := id.NewViewID()
	i1 := view.New().ID(iId1).UpdatedAt(now).MustBuild()

	tests := []struct {
		name    string
		seeds   view.List
		arg     view.ID
		want    view.List
		wantErr error
		mockErr bool
	}{
		{
			name:    "remove",
			seeds:   view.List{},
			arg:     iId1,
			want:    view.List{},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "remove 1",
			seeds:   view.List{i1},
			arg:     iId1,
			want:    nil,
			wantErr: nil,
		},
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewView()
			if tc.mockErr {
				SetViewError(r, tc.wantErr)
			}
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
				if tc.wantErr != nil {
					assert.ErrorIs(t, err, tc.wantErr)
					return
				}
			}

			err := r.Remove(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, []*view.View(tc.want), r.(*View).data.Values())
		})
	}
}
