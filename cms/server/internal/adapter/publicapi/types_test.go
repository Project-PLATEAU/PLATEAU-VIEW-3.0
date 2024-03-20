package publicapi

import (
	"encoding/json"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewItem(t *testing.T) {
	as := asset.New().
		NewID().
		Project(id.NewProjectID()).
		CreatedByUser(accountdomain.NewUserID()).
		Thread(id.NewThreadID()).
		Size(1).
		NewUUID().
		MustBuild()
	af := asset.NewFile().Name("name.json").Path("name.json").Size(1).Build()
	s2 := schema.New().
		NewID().
		Project(id.NewProjectID()).
		Workspace(accountdomain.NewWorkspaceID()).
		Fields([]*schema.Field{
			schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(key.New("test1")).MustBuild(),
		}).
		MustBuild()

	g := group.New().
		NewID().
		Name("test group").
		Project(id.NewProjectID()).
		Key(key.New("group1")).
		Schema(s2.ID()).
		MustBuild()

	s := schema.New().
		NewID().
		Project(id.NewProjectID()).
		Workspace(accountdomain.NewWorkspaceID()).
		Fields([]*schema.Field{
			schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(key.New("aaaaa")).MustBuild(),
			schema.NewField(schema.NewAsset().TypeProperty()).NewID().Key(key.New("bbbbb")).MustBuild(),
			schema.NewField(schema.NewGroup(g.ID()).TypeProperty()).NewID().Key(key.New("ggggg")).MustBuild(),
		}).
		MustBuild()
	ig := id.NewItemGroupID()
	it := item.New().
		NewID().
		Schema(id.NewSchemaID()).
		Project(id.NewProjectID()).
		Model(id.NewModelID()).
		Thread(id.NewThreadID()).
		Fields([]*item.Field{
			item.NewField(s.Fields()[0].ID(), value.New(value.TypeText, "aaaa").AsMultiple(), nil),
			item.NewField(s.Fields()[1].ID(), value.New(value.TypeAsset, as.ID()).AsMultiple(), nil),
			item.NewField(s.Fields()[2].ID(), value.New(value.TypeGroup, ig).AsMultiple(), nil),
			item.NewField(s2.Fields()[0].ID(), value.New(value.TypeText, "xxxx").AsMultiple(), ig.Ref()),
		}).
		MustBuild()
	resGroup := ItemFields{
		"test1": "xxxx",
	}

	assert.Equal(t, Item{
		ID: it.ID().String(),
		Fields: ItemFields(map[string]any{
			"aaaaa": "aaaa",
			"bbbbb": ItemAsset{
				Type: "asset",
				ID:   as.ID().String(),
				URL:  "https://example.com/" + as.ID().String() + af.Path(),
			},
			"ggggg": resGroup,
		}),
	}, NewItem(it, schema.NewPackage(s, nil, map[id.GroupID]*schema.Schema{id.NewGroupID(): s2}, nil), asset.List{as}, func(a *asset.Asset) string {
		return "https://example.com/" + a.ID().String() + af.Path()
	}, nil))

	// no assets
	assert.Equal(t, Item{
		ID: it.ID().String(),
		Fields: ItemFields(map[string]any{
			"aaaaa": "aaaa",
			"ggggg": resGroup,
		}),
	}, NewItem(it, schema.NewPackage(s, nil, map[id.GroupID]*schema.Schema{id.NewGroupID(): s2}, nil), nil, nil, nil))
}

func TestNewItem_Multiple(t *testing.T) {
	as := asset.New().
		NewID().
		Project(id.NewProjectID()).
		CreatedByUser(accountdomain.NewUserID()).
		Thread(id.NewThreadID()).
		Size(1).
		NewUUID().
		MustBuild()
	af := asset.NewFile().Name("name.json").Path("name.json").Size(1).ContentType("application/json").Build()
	s := schema.New().
		NewID().
		Project(id.NewProjectID()).
		Workspace(accountdomain.NewWorkspaceID()).
		Fields([]*schema.Field{
			schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(key.New("aaaaa")).Multiple(true).MustBuild(),
			schema.NewField(schema.NewAsset().TypeProperty()).NewID().Key(key.New("bbbbb")).Multiple(true).MustBuild(),
		}).
		MustBuild()
	it := item.New().
		NewID().
		Schema(id.NewSchemaID()).
		Project(id.NewProjectID()).
		Model(id.NewModelID()).
		Thread(id.NewThreadID()).
		Fields([]*item.Field{
			item.NewField(s.Fields()[0].ID(), value.New(value.TypeText, "aaaa").AsMultiple(), nil),
			item.NewField(s.Fields()[1].ID(), value.New(value.TypeAsset, as.ID()).AsMultiple(), nil),
		}).
		MustBuild()

	assert.Equal(t, Item{
		ID: it.ID().String(),
		Fields: ItemFields(map[string]any{
			"aaaaa": []any{"aaaa"},
			"bbbbb": []ItemAsset{{
				Type: "asset",
				ID:   as.ID().String(),
				URL:  "https://example.com/" + as.ID().String() + af.Path(),
			}},
		}),
	}, NewItem(it, schema.NewPackage(s, nil, nil, nil), asset.List{as}, func(a *asset.Asset) string {
		return "https://example.com/" + a.ID().String() + af.Path()
	}, nil))

	// no assets
	assert.Equal(t, Item{
		ID: it.ID().String(),
		Fields: ItemFields(map[string]any{
			"aaaaa": []any{"aaaa"},
		}),
	}, NewItem(it, schema.NewPackage(s, nil, nil, nil), nil, nil, nil))
}

func TestItem_MarshalJSON(t *testing.T) {
	j := lo.Must(json.Marshal(Item{
		ID: "xxx",
		Fields: ItemFields{
			"aaa": "aa",
			"bbb": ItemAsset{
				Type: "asset",
				ID:   "xxx",
				URL:  "https://example.com",
			},
		},
	}))

	v := map[string]any{}
	lo.Must0(json.Unmarshal(j, &v))

	assert.Equal(t, map[string]any{
		"id":  "xxx",
		"aaa": "aa",
		"bbb": map[string]any{
			"type": "asset",
			"id":   "xxx",
			"url":  "https://example.com",
		},
	}, v)
}

func TestNewListResult(t *testing.T) {
	assert.Equal(t, ListResult[any]{
		Results:    []any{},
		TotalCount: 1010,
		HasMore:    lo.ToPtr(true),
		Limit:      lo.ToPtr(int64(100)),
		Offset:     lo.ToPtr(int64(250)),
		Page:       lo.ToPtr(int64(3)),
	}, NewListResult[any](nil, &usecasex.PageInfo{
		TotalCount: 1010,
	}, usecasex.OffsetPagination{
		Offset: 250,
		Limit:  100,
	}.Wrap()))

	assert.Equal(t, ListResult[any]{
		Results:    []any{},
		TotalCount: 150,
		HasMore:    lo.ToPtr(false),
		Limit:      lo.ToPtr(int64(100)),
		Offset:     lo.ToPtr(int64(100)),
		Page:       lo.ToPtr(int64(2)),
	}, NewListResult[any](nil, &usecasex.PageInfo{
		TotalCount: 150,
	}, usecasex.OffsetPagination{
		Offset: 100,
		Limit:  100,
	}.Wrap()))

	assert.Equal(t, ListResult[any]{
		Results:    []any{},
		TotalCount: 50,
		HasMore:    lo.ToPtr(false),
		Limit:      lo.ToPtr(int64(50)),
		Offset:     lo.ToPtr(int64(0)),
		Page:       lo.ToPtr(int64(1)),
	}, NewListResult[any](nil, &usecasex.PageInfo{
		TotalCount: 50,
	}, usecasex.OffsetPagination{
		Offset: 0,
		Limit:  50,
	}.Wrap()))

	assert.Equal(t, ListResult[any]{
		Results:    []any{},
		TotalCount: 50,
		HasMore:    lo.ToPtr(true),
		NextCursor: lo.ToPtr("cur"),
	}, NewListResult[any](nil, &usecasex.PageInfo{
		TotalCount:  50,
		EndCursor:   usecasex.Cursor("cur").Ref(),
		HasNextPage: true,
	}, usecasex.CursorPagination{
		First: lo.ToPtr(int64(100)),
	}.Wrap()))
}
