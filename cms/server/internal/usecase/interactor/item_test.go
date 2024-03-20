package interactor

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewItem(t *testing.T) {
	r := repo.Container{}
	i := NewItem(&r, nil)
	assert.NotNil(t, i)
}

func TestItem_FindByID(t *testing.T) {
	sid := id.NewSchemaID()
	id1 := id.NewItemID()
	i1 := item.New().ID(id1).Schema(sid).Model(id.NewModelID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID()).MustBuild()
	id2 := id.NewItemID()
	i2 := item.New().ID(id2).Schema(sid).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID()).MustBuild()

	wid := accountdomain.NewWorkspaceID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
	}

	tests := []struct {
		name  string
		seeds item.List
		args  struct {
			id       id.ItemID
			operator *usecase.Operator
		}
		want        *item.Item
		mockItemErr bool
		wantErr     error
	}{
		{
			name:  "find 1 of 2",
			seeds: item.List{i1, i2},
			args: struct {
				id       id.ItemID
				operator *usecase.Operator
			}{
				id:       id1,
				operator: op,
			},
			want:    i1,
			wantErr: nil,
		},
		{
			name:  "find 1 of 0",
			seeds: item.List{},
			args: struct {
				id       id.ItemID
				operator *usecase.Operator
			}{
				id:       id1,
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockItemErr {
				memory.SetItemError(db.Item, tc.wantErr)
			}
			for _, p := range tc.seeds {
				err := db.Item.Save(ctx, p)
				assert.NoError(t, err)
			}
			itemUC := NewItem(db, nil)
			itemUC.ignoreEvent = true

			got, err := itemUC.FindByID(ctx, tc.args.id, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got.Value())
		})
	}
}

func TestItem_FindByIDs(t *testing.T) {
	sid := id.NewSchemaID()

	tests := []struct {
		name    string
		seeds   item.List
		arg     id.ItemIDList
		want    item.VersionedList
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   item.List{},
			arg:     []id.ItemID{},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with item for another workspaces",
			seeds: item.List{
				item.New().NewID().Schema(sid).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID()).MustBuild(),
			},
			arg:     []id.ItemID{},
			want:    nil,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			for _, i := range tc.seeds {
				err := db.Item.Save(ctx, i)
				assert.NoError(t, err)
			}
			itemUC := NewItem(db, nil)

			got, err := itemUC.FindByIDs(ctx, tc.arg, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestItem_FindBySchema(t *testing.T) {
	uid := accountdomain.NewUserID()
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s1 := schema.New().NewID().Workspace(wid).Project(pid).Fields(schema.FieldList{sf1}).MustBuild()
	s2 := schema.New().NewID().Workspace(wid).Project(pid).MustBuild()
	restore := util.MockNow(time.Now().Truncate(time.Millisecond).UTC())
	i1 := item.New().NewID().
		Schema(s1.ID()).
		Model(id.NewModelID()).
		Project(pid).
		Fields([]*item.Field{
			item.NewField(sf1.ID(), value.TypeBool.Value(true).AsMultiple(), nil),
		}).
		Thread(id.NewThreadID()).
		MustBuild()
	restore()
	restore = util.MockNow(time.Now().Truncate(time.Millisecond).Add(time.Second).UTC())
	i2 := item.New().NewID().
		Schema(s1.ID()).
		Model(id.NewModelID()).
		Project(pid).
		Fields([]*item.Field{
			item.NewField(sf1.ID(), value.TypeBool.Value(true).AsMultiple(), nil),
		}).
		Thread(id.NewThreadID()).
		MustBuild()
	restore()
	restore = util.MockNow(time.Now().Truncate(time.Millisecond).Add(time.Second * 2).UTC())
	i3 := item.New().NewID().
		Schema(s2.ID()).
		Model(id.NewModelID()).
		Project(pid).Thread(id.NewThreadID()).MustBuild()
	restore()

	type args struct {
		schema     id.SchemaID
		operator   *usecase.Operator
		pagination *usecasex.Pagination
	}

	tests := []struct {
		name        string
		seedItems   item.List
		seedSchema  *schema.Schema
		args        args
		want        int
		wantErr     error
		mockItemErr bool
	}{
		{
			name:       "find 2 of 3",
			seedItems:  item.List{i1, i2, i3},
			seedSchema: s1,
			args: args{
				schema: s1.ID(),
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User: &uid,
					},
					ReadableProjects: []id.ProjectID{pid},
					WritableProjects: []id.ProjectID{pid},
				},
			},
			want:    2,
			wantErr: nil,
		},
		{
			name:       "items not found",
			seedItems:  item.List{},
			seedSchema: s1,
			args: args{
				schema: s1.ID(),
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User: &uid,
					},
					ReadableProjects: []id.ProjectID{pid},
					WritableProjects: []id.ProjectID{pid},
				},
			},
			want:    0,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			// t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockItemErr {
				memory.SetItemError(db.Item, tc.wantErr)
			}

			for _, seed := range tc.seedItems {
				err := db.Item.Save(ctx, seed)
				assert.NoError(t, err)
			}
			if tc.seedSchema != nil {
				err := db.Schema.Save(ctx, tc.seedSchema)
				assert.NoError(t, err)
			}

			itemUC := NewItem(db, nil)
			itemUC.ignoreEvent = true

			got, _, err := itemUC.FindBySchema(ctx, tc.args.schema, nil, tc.args.pagination, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))
		})
	}
}

func TestItem_FindAllVersionsByID(t *testing.T) {
	now := util.Now()
	defer util.MockNow(now)()

	sid := id.NewSchemaID()
	id1 := id.NewItemID()
	i1 := item.New().ID(id1).Project(id.NewProjectID()).Schema(sid).Model(id.NewModelID()).Thread(id.NewThreadID()).MustBuild()

	wid := accountdomain.NewWorkspaceID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		}}
	ctx := context.Background()

	db := memory.New()
	err := db.Item.Save(ctx, i1)
	assert.NoError(t, err)

	itemUC := NewItem(db, nil)
	itemUC.ignoreEvent = true

	// first version
	res, err := itemUC.FindAllVersionsByID(ctx, id1, op)
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.NewValue(res[0].Version(), nil, version.NewRefs(version.Latest), now, i1),
	}, res)

	// second version
	err = db.Item.Save(ctx, i1)
	assert.NoError(t, err)

	res, err = itemUC.FindAllVersionsByID(ctx, id1, op)
	assert.NoError(t, err)
	assert.Equal(t, item.VersionedList{
		version.NewValue(res[0].Version(), nil, nil, now, i1),
		version.NewValue(res[1].Version(), version.NewVersions(res[0].Version()), version.NewRefs(version.Latest), now, i1),
	}, res)

	// not found
	res, err = itemUC.FindAllVersionsByID(ctx, id.NewItemID(), op)
	assert.NoError(t, err)
	assert.Empty(t, res)

	// mock item error
	wantErr := errors.New("test")
	memory.SetItemError(db.Item, wantErr)
	item2, err := itemUC.FindAllVersionsByID(ctx, id1, op)
	assert.Nil(t, item2)
	assert.Equal(t, wantErr, err)
}

func TestItem_FindByProject(t *testing.T) {
	pid1 := id.NewProjectID()
	pid2 := id.NewProjectID()
	wid := accountdomain.NewWorkspaceID()
	s1 := project.New().ID(pid1).Workspace(wid).MustBuild()
	s2 := project.New().ID(pid2).Workspace(wid).MustBuild()
	i1 := item.New().NewID().
		Project(pid1).
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Thread(id.NewThreadID()).
		Timestamp(time.Now().Truncate(time.Millisecond).UTC()).
		MustBuild()
	i2 := item.New().NewID().
		Project(pid1).
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Thread(id.NewThreadID()).
		Timestamp(time.Now().Truncate(time.Millisecond).Add(time.Second).UTC()).
		MustBuild()
	i3 := item.New().NewID().
		Project(pid2).
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Thread(id.NewThreadID()).
		Timestamp(time.Now().Truncate(time.Millisecond).Add(time.Second * 2).UTC()).
		MustBuild()

	u := user.New().NewID().Email("aaa@bbb.com").Name("foo").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
		ReadableProjects: []id.ProjectID{pid1, pid2},
	}

	type args struct {
		id         id.ProjectID
		operator   *usecase.Operator
		pagination *usecasex.Pagination
	}

	tests := []struct {
		name        string
		seedItems   item.List
		seedProject *project.Project
		args        args
		want        int
		mockItemErr bool
		wantErr     error
	}{
		{
			name:        "find 2 of 3",
			seedItems:   item.List{i1, i2, i3},
			seedProject: s1,
			args: args{
				id:       pid1,
				operator: op,
			},
			want:    2,
			wantErr: nil,
		},
		{
			name:        "items not found",
			seedItems:   item.List{},
			seedProject: s1,
			args: args{
				id:       pid1,
				operator: op,
			},
			want:    0,
			wantErr: nil,
		},
		{
			name:        "project not found",
			seedItems:   item.List{i1, i2, i3},
			seedProject: s2,
			args: args{
				id:       id.NewProjectID(),
				operator: op,
			},
			want:    0,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			// t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockItemErr {
				memory.SetItemError(db.Item, tc.wantErr)
			}
			for _, seed := range tc.seedItems {
				err := db.Item.Save(ctx, seed)
				assert.NoError(t, err)
			}
			err := db.Project.Save(ctx, tc.seedProject)
			assert.NoError(t, err)
			itemUC := NewItem(db, nil)
			itemUC.ignoreEvent = true

			got, _, err := itemUC.FindByProject(ctx, tc.args.id, tc.args.pagination, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got.Unwrap()))
		})
	}
}

func TestItem_Search(t *testing.T) {
	mid := id.NewModelID()
	sid1 := id.NewSchemaID()
	sf1 := id.NewFieldID()
	sf2 := id.NewFieldID()
	f1 := item.NewField(sf1, value.TypeText.Value("foo").AsMultiple(), nil)
	f2 := item.NewField(sf2, value.TypeText.Value("hoge").AsMultiple(), nil)
	id1 := id.NewItemID()
	pid := id.NewProjectID()
	i1 := item.New().ID(id1).Schema(sid1).Model(mid).Project(pid).Fields([]*item.Field{f1}).Thread(id.NewThreadID()).MustBuild()
	id2 := id.NewItemID()
	i2 := item.New().ID(id2).Schema(sid1).Model(mid).Project(pid).Fields([]*item.Field{f1}).Thread(id.NewThreadID()).MustBuild()
	id3 := id.NewItemID()
	i3 := item.New().ID(id3).Schema(sid1).Model(mid).Project(pid).Fields([]*item.Field{f2}).Thread(id.NewThreadID()).MustBuild()

	wid := accountdomain.NewWorkspaceID()
	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid).Name("foo").MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
	}

	tests := []struct {
		name  string
		seeds struct {
			items item.List
		}
		args struct {
			query    *item.Query
			operator *usecase.Operator
		}
		want        int
		mockItemErr bool
		wantErr     error
	}{
		{
			name: "find 2 of 3",
			seeds: struct {
				items item.List
			}{
				items: item.List{i1, i2, i3},
			},
			args: struct {
				query    *item.Query
				operator *usecase.Operator
			}{
				query:    item.NewQuery(pid, mid, nil, "foo", nil),
				operator: op,
			},
			want:    2,
			wantErr: nil,
		},
		{
			name: "find 1 of 3",
			seeds: struct {
				items item.List
			}{
				items: item.List{i1, i2, i3},
			},
			args: struct {
				query    *item.Query
				operator *usecase.Operator
			}{
				query:    item.NewQuery(pid, mid, nil, "hoge", nil),
				operator: op,
			},
			want:    1,
			wantErr: nil,
		},
		{
			name: "items not found",
			seeds: struct {
				items item.List
			}{
				items: item.List{i1, i2, i3},
			},
			args: struct {
				query    *item.Query
				operator *usecase.Operator
			}{
				query:    item.NewQuery(pid, mid, nil, "xxx", nil),
				operator: op,
			},
			want:    0,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockItemErr {
				memory.SetItemError(db.Item, tc.wantErr)
			}
			for _, seed := range tc.seeds.items {
				err := db.Item.Save(ctx, seed)
				assert.Nil(t, err)
			}
			itemUC := NewItem(db, nil)
			itemUC.ignoreEvent = true

			got, _, err := itemUC.Search(ctx, schema.Package{}, tc.args.query, nil, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(got))

		})
	}
}

func TestItem_IsItemReferenced(t *testing.T) {
	r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
	w := accountdomain.NewWorkspaceID()
	prj := project.New().NewID().Workspace(w).RequestRoles(r).MustBuild()

	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	fid1 := id.NewFieldID()
	fid2 := id.NewFieldID()
	cf1 := &schema.CorrespondingField{
		Title:       "title",
		Key:         "key",
		Description: "description",
		Required:    true,
	}
	sf1 := schema.NewField(schema.NewReference(id.NewModelID(), sid2, fid2.Ref(), cf1).TypeProperty()).ID(fid1).Name("f").Unique(true).Key(key.Random()).MustBuild()
	s1 := schema.New().ID(sid1).Workspace(w).Project(prj.ID()).Fields(schema.FieldList{sf1}).MustBuild()
	m1 := model.New().NewID().Schema(s1.ID()).Key(key.Random()).Project(s1.Project()).MustBuild()
	fs1 := []*item.Field{item.NewField(sf1.ID(), value.TypeReference.Value(id.NewItemID()).AsMultiple(), nil)}
	i1 := item.New().NewID().Schema(s1.ID()).Model(m1.ID()).Project(s1.Project()).Thread(id.NewThreadID()).Fields(fs1).MustBuild()

	cf2 := &schema.CorrespondingField{
		Title:       "title",
		Key:         "key",
		Description: "description",
		Required:    true,
	}
	sf2 := schema.NewField(schema.NewReference(id.NewModelID(), sid1, fid1.Ref(), cf2).TypeProperty()).ID(fid2).Name("f").Unique(true).Key(key.Random()).MustBuild()
	s2 := schema.New().ID(sid2).Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf2}).MustBuild()
	m2 := model.New().NewID().Schema(s2.ID()).Key(key.Random()).Project(s2.Project()).MustBuild()
	fs2 := []*item.Field{item.NewField(sf2.ID(), value.TypeReference.Value(id.NewItemID()).AsMultiple(), nil)}
	i2 := item.New().NewID().Schema(s2.ID()).Model(m2.ID()).Project(s2.Project()).Thread(id.NewThreadID()).Fields(fs2).MustBuild()

	fid3 := id.NewFieldID()
	sf3 := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).ID(fid3).Name("f").Unique(true).Key(key.Random()).MustBuild()
	s3 := schema.New().ID(sid2).Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf3}).MustBuild()
	m3 := model.New().NewID().Schema(s3.ID()).Key(key.Random()).Project(s3.Project()).MustBuild()
	fs3 := []*item.Field{item.NewField(sf3.ID(), value.TypeReference.Value(nil).AsMultiple(), nil)}
	i3 := item.New().NewID().Schema(s3.ID()).Model(m3.ID()).Project(s3.Project()).Thread(id.NewThreadID()).Fields(fs3).MustBuild()

	ctx := context.Background()
	db := memory.New()
	lo.Must0(db.Project.Save(ctx, prj))
	lo.Must0(db.Schema.Save(ctx, s1))
	lo.Must0(db.Model.Save(ctx, m1))
	lo.Must0(db.Item.Save(ctx, i1))
	lo.Must0(db.Schema.Save(ctx, s2))
	lo.Must0(db.Model.Save(ctx, m2))
	lo.Must0(db.Item.Save(ctx, i2))
	lo.Must0(db.Schema.Save(ctx, s3))
	lo.Must0(db.Model.Save(ctx, m3))
	lo.Must0(db.Item.Save(ctx, i3))
	itemUC := NewItem(db, nil)
	itemUC.ignoreEvent = true

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               accountdomain.NewUserID().Ref(),
			ReadableWorkspaces: []accountdomain.WorkspaceID{s1.Workspace()},
			WritableWorkspaces: []accountdomain.WorkspaceID{s1.Workspace()},
		},
		ReadableProjects: []id.ProjectID{prj.ID()},
		WritableProjects: []id.ProjectID{prj.ID()},
	}

	// reference item
	b, err := itemUC.IsItemReferenced(ctx, i1.ID(), fid2, op)
	assert.True(t, b)
	assert.Nil(t, err)

	// reference item different field
	b, err = itemUC.IsItemReferenced(ctx, i1.ID(), sf3.ID(), op)
	assert.False(t, b)
	assert.Nil(t, err)

	// not reference item 1
	b, err = itemUC.IsItemReferenced(ctx, i3.ID(), sf3.ID(), op)
	assert.False(t, b)
	assert.Nil(t, err)

	// not reference item 2
	b, err = itemUC.IsItemReferenced(ctx, i3.ID(), id.NewFieldID(), op)
	assert.False(t, b)
	assert.Nil(t, err)

	// item not found
	b, err = itemUC.IsItemReferenced(ctx, id.NewItemID(), sf2.ID(), op)
	assert.False(t, b)
	assert.Error(t, err)
}

func TestItem_Create(t *testing.T) {
	r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
	prj := project.New().NewID().RequestRoles(r).MustBuild()
	sf := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Name("f").Unique(true).Key(key.Random()).MustBuild()
	s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf}).MustBuild()
	m := model.New().NewID().Schema(s.ID()).Key(key.Random()).Project(s.Project()).MustBuild()

	ctx := context.Background()
	db := memory.New()
	lo.Must0(db.Project.Save(ctx, prj))
	lo.Must0(db.Schema.Save(ctx, s))
	lo.Must0(db.Model.Save(ctx, m))
	itemUC := NewItem(db, nil)
	itemUC.ignoreEvent = true

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               accountdomain.NewUserID().Ref(),
			ReadableWorkspaces: []accountdomain.WorkspaceID{s.Workspace()},
			WritableWorkspaces: []accountdomain.WorkspaceID{s.Workspace()},
		},
		ReadableProjects: []id.ProjectID{s.Project()},
		WritableProjects: []id.ProjectID{s.Project()},
	}

	// invalid operator
	item, err := itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "xxx",
			},
		},
	}, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
	assert.Equal(t, interfaces.ErrInvalidOperator, err)
	assert.Nil(t, item)

	// operation denied
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "xxx",
			},
		},
	}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref()},
	})
	assert.Equal(t, interfaces.ErrOperationDenied, err)
	assert.Nil(t, item)

	// ok
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "xxx",
			},
		},
	}, op)
	assert.NoError(t, err)
	assert.NotNil(t, item)
	assert.Equal(t, s.ID(), item.Value().Schema())

	it, err := db.Item.FindByID(ctx, item.Value().ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, item, it)
	assert.Equal(t, value.TypeText.Value("xxx").AsMultiple(), it.Value().Field(sf.ID()).Value())

	// validate fails
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "abcabcabcabc", // too long
			},
		},
	}, op)
	assert.ErrorContains(t, err, "it sholud be shorter than 10")
	assert.Nil(t, item)

	// duplicated
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "xxx", // duplicated
			},
		},
	}, op)
	assert.Equal(t, interfaces.ErrDuplicatedItemValue, err)
	assert.Nil(t, item)

	// required
	sf.SetRequired(true)
	s.RemoveField(sf.ID())
	s.AddField(sf)
	lo.Must0(db.Schema.Save(ctx, s))
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "",
			},
		},
	}, op)
	assert.ErrorIs(t, err, schema.ErrValueRequired)
	assert.Nil(t, item)

	// mock item error
	wantErr := errors.New("test")
	memory.SetItemError(db.Item, wantErr)
	item, err = itemUC.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields:   nil,
	}, op)
	assert.Equal(t, wantErr, err)
	assert.Nil(t, item)
}

func TestItem_Update(t *testing.T) {
	uId := accountdomain.NewUserID().Ref()
	prj := project.New().NewID().MustBuild()
	sf := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Name("f").Unique(true).Key(key.Random()).MustBuild()
	s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{sf}).MustBuild()
	m := model.New().NewID().Schema(s.ID()).Key(key.Random()).Project(s.Project()).MustBuild()
	i := item.New().NewID().User(*uId).Model(m.ID()).Project(s.Project()).Schema(s.ID()).Thread(id.NewThreadID()).MustBuild()
	i2 := item.New().NewID().User(*uId).Model(m.ID()).Project(s.Project()).Schema(s.ID()).Thread(id.NewThreadID()).MustBuild()
	i3 := item.New().NewID().User(accountdomain.NewUserID()).Model(m.ID()).Project(s.Project()).Schema(s.ID()).Thread(id.NewThreadID()).MustBuild()

	ctx := context.Background()
	db := memory.New()
	lo.Must0(db.Project.Save(ctx, prj))
	lo.Must0(db.Schema.Save(ctx, s))
	lo.Must0(db.Model.Save(ctx, m))
	lo.Must0(db.Item.Save(ctx, i))
	lo.Must0(db.Item.Save(ctx, i2))
	lo.Must0(db.Item.Save(ctx, i3))
	itemUC := NewItem(db, nil)
	itemUC.ignoreEvent = true
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: uId,
		},
		ReadableProjects: []id.ProjectID{s.Project()},
		WritableProjects: []id.ProjectID{s.Project()},
	}
	vi, _ := itemUC.FindByID(ctx, i.ID(), op)

	// ok
	item, err := itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "xxx",
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.NoError(t, err)
	assert.Equal(t, i.ID(), item.Value().ID())
	assert.Equal(t, s.ID(), item.Value().Schema())

	it, err := db.Item.FindByID(ctx, item.Value().ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, item.Value(), it.Value())
	assert.Equal(t, value.TypeText.Value("xxx").AsMultiple(), it.Value().Field(sf.ID()).Value())

	// invalid operator
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "xxx",
			},
		},
	}, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
	assert.Equal(t, interfaces.ErrInvalidOperator, err)
	assert.Nil(t, item)
	vi, _ = itemUC.FindByID(ctx, i.ID(), op)

	// ok with key
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Key:   sf.Key().Ref(),
				Type:  value.TypeText,
				Value: "yyy",
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.NoError(t, err)
	assert.Equal(t, i.ID(), item.Value().ID())
	assert.Equal(t, s.ID(), item.Value().Schema())

	it, err = db.Item.FindByID(ctx, item.Value().ID(), nil)
	assert.NoError(t, err)
	assert.Equal(t, item.Value(), it.Value())
	assert.Equal(t, value.TypeText.Value("yyy").AsMultiple(), it.Value().Field(sf.ID()).Value())
	vi, _ = itemUC.FindByID(ctx, i.ID(), op)

	// validate fails
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "abcabcabcabc", // too long
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.ErrorContains(t, err, "it sholud be shorter than 10")
	assert.Nil(t, item)
	vi, _ = itemUC.FindByID(ctx, i.ID(), op)

	// update same item is not a duplicate
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "xxx", // duplicated
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.NoError(t, err)
	assert.Equal(t, i.ID(), item.Value().ID())
	assert.Equal(t, s.ID(), item.Value().Schema())
	vi3, _ := itemUC.FindByID(ctx, i3.ID(), op)

	// update no permission
	_, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i3.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "xxx",
			},
		},
		Version: lo.ToPtr(vi3.Version()),
	}, op)
	assert.Equal(t, interfaces.ErrOperationDenied, err)
	vi2, _ := itemUC.FindByID(ctx, i2.ID(), op)

	// duplicate
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i2.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "xxx", // duplicated
			},
		},
		Version: lo.ToPtr(vi2.Version()),
	}, op)
	assert.Equal(t, interfaces.ErrDuplicatedItemValue, err)
	assert.Nil(t, item)

	// no fields
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{},
	}, op)
	assert.Equal(t, interfaces.ErrItemFieldRequired, err)
	assert.Nil(t, item)

	// required
	sf.SetRequired(true)
	s.RemoveField(sf.ID())
	s.AddField(sf)
	lo.Must0(db.Schema.Save(ctx, s))
	vi, _ = itemUC.FindByID(ctx, i.ID(), op)

	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "",
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.ErrorIs(t, err, schema.ErrValueRequired)
	assert.Nil(t, item)
	vi, _ = itemUC.FindByID(ctx, i.ID(), op)

	// mock item error
	wantErr := errors.New("test")
	memory.SetItemError(db.Item, wantErr)
	item, err = itemUC.Update(ctx, interfaces.UpdateItemParam{
		ItemID: i.ID(),
		Fields: []interfaces.ItemFieldParam{
			{
				Field: sf.ID().Ref(),
				Type:  value.TypeText,
				Value: "a",
			},
		},
		Version: lo.ToPtr(vi.Version()),
	}, op)
	assert.Equal(t, wantErr, err)
	assert.Nil(t, item)
}

func TestItem_Delete(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	s1 := schema.New().NewID().Workspace(wid).Project(pid).MustBuild()
	s2 := schema.New().NewID().Workspace(wid).Project(pid).MustBuild()
	id1 := id.NewItemID()
	id2 := id.NewItemID()
	id3 := id.NewItemID()
	id4 := id.NewItemID()
	i1 := item.New().ID(id1).User(u.ID()).Schema(s1.ID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID()).MustBuild()
	i2 := item.New().ID(id2).User(u.ID()).Schema(s2.ID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID()).MustBuild()
	i3 := item.New().ID(id3).User(u.ID()).Schema(s1.ID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID()).MustBuild()

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
		WritableProjects: id.ProjectIDList{i1.Project()},
	}
	ctx := context.Background()

	db := memory.New()
	err := db.Item.Save(ctx, i1)
	assert.NoError(t, err)
	err = db.Item.Save(ctx, i2)
	assert.NoError(t, err)
	err = db.Schema.Save(ctx, s1)
	assert.NoError(t, err)
	err = db.Schema.Save(ctx, s2)
	assert.NoError(t, err)
	err = db.Item.Save(ctx, i3)
	assert.NoError(t, err)

	itemUC := NewItem(db, nil)
	itemUC.ignoreEvent = true
	err = itemUC.Delete(ctx, id1, op)
	assert.NoError(t, err)

	// invalid operator
	err = itemUC.Delete(ctx, id2, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
	assert.Equal(t, interfaces.ErrInvalidOperator, err)

	// operation denied
	err = itemUC.Delete(ctx, id3, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
	})
	assert.Equal(t, interfaces.ErrOperationDenied, err)

	// not found
	err = itemUC.Delete(ctx, id4, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
	})
	assert.Equal(t, rerror.ErrNotFound, err)

	_, err = itemUC.FindByID(ctx, id1, op)
	assert.Error(t, err)

	// mock item error
	wantErr := rerror.ErrNotFound
	err = itemUC.Delete(ctx, id.NewItemID(), op)
	assert.Equal(t, wantErr, err)
}

func TestWorkFlow(t *testing.T) {
	now := util.Now()
	defer util.MockNow(now)()

	wid := accountdomain.NewWorkspaceID()
	prj := project.New().NewID().Workspace(wid).MustBuild()
	s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).MustBuild()
	m := model.New().NewID().Project(prj.ID()).Schema(s.ID()).RandomKey().MustBuild()
	i := item.New().NewID().Schema(s.ID()).Model(m.ID()).Project(prj.ID()).Thread(id.NewThreadID()).MustBuild()
	ri, _ := request.NewItem(i.ID())
	u := user.New().Name("aaa").NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	req1 := request.New().
		NewID().
		Workspace(wid).
		Project(prj.ID()).
		Reviewers(accountdomain.UserIDList{u.ID()}).
		CreatedBy(accountdomain.NewUserID()).
		Thread(id.NewThreadID()).
		Items(request.ItemList{ri}).
		Title("foo").
		MustBuild()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:             lo.ToPtr(u.ID()),
			OwningWorkspaces: id.WorkspaceIDList{wid},
		},
	}
	ctx := context.Background()

	db := memory.New()
	err := db.Project.Save(ctx, prj)
	assert.NoError(t, err)
	err = db.Schema.Save(ctx, s)
	assert.NoError(t, err)
	err = db.Model.Save(ctx, m)
	assert.NoError(t, err)
	err = db.Item.Save(ctx, i)
	assert.NoError(t, err)

	itemUC := NewItem(db, nil)

	status, err := itemUC.ItemStatus(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)
	assert.Equal(t, map[id.ItemID]item.Status{i.ID(): item.StatusDraft}, status)

	err = db.Request.Save(ctx, req1)
	assert.NoError(t, err)

	status, err = itemUC.ItemStatus(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)
	assert.Equal(t, map[id.ItemID]item.Status{i.ID(): item.StatusReview}, status)

	requestUC := NewRequest(db, nil)
	_, err = requestUC.Approve(ctx, req1.ID(), op)
	assert.NoError(t, err)

	status, err = itemUC.ItemStatus(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)
	assert.Equal(t, map[id.ItemID]item.Status{i.ID(): item.StatusPublic}, status)

	_, err = itemUC.Unpublish(ctx, id.ItemIDList{i.ID()}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: id.WorkspaceIDList{wid},
		},
	})
	assert.Equal(t, err, interfaces.ErrInvalidOperator)

	_, err = itemUC.Unpublish(ctx, id.ItemIDList{i.ID()}, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
	assert.Equal(t, err, interfaces.ErrInvalidOperator)

	_, err = itemUC.Unpublish(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)

	status, err = itemUC.ItemStatus(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)
	assert.Equal(t, map[id.ItemID]item.Status{i.ID(): item.StatusDraft}, status)

	// Publish Item
	_, err = itemUC.Publish(ctx, id.ItemIDList{i.ID()}, &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(u.ID()),
			ReadableWorkspaces: id.WorkspaceIDList{wid},
		},
	})
	assert.Equal(t, err, interfaces.ErrInvalidOperator)

	_, err = itemUC.Publish(ctx, id.ItemIDList{i.ID()}, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
	assert.Equal(t, err, interfaces.ErrInvalidOperator)

	_, err = itemUC.Publish(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)

	status, err = itemUC.ItemStatus(ctx, id.ItemIDList{i.ID()}, op)
	assert.NoError(t, err)
	assert.Equal(t, map[id.ItemID]item.Status{i.ID(): item.StatusPublic}, status)
}
