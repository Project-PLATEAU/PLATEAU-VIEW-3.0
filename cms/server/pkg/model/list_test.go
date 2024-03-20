package model

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&Model{id: id2},
		&Model{id: id1},
	}
	res := list.SortByID()
	assert.Equal(t, List{
		&Model{id: id1},
		&Model{id: id2},
	}, res)
	// test whether original list is not modified
	assert.Equal(t, List{
		&Model{id: id2},
		&Model{id: id1},
	}, list)
}

func TestList_Clone(t *testing.T) {
	id := NewID()
	list := List{&Model{id: id}}
	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])

	got[0].id = NewID()
	// test whether original list is not modified
	assert.Equal(t, list, List{&Model{id: id}})
}

func TestList_OrderByIDs(t *testing.T) {
	pid := id.NewProjectID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	sid3 := id.NewSchemaID()
	mod1 := New().NewID().Project(pid).Schema(sid1).Key(key.New("key1")).Order(0).MustBuild()
	mod2 := New().NewID().Project(pid).Schema(sid2).Key(key.New("key2")).Order(0).MustBuild()
	mod3 := New().NewID().Project(pid).Schema(sid3).Key(key.New("key3")).Order(0).MustBuild()
	mods := List{mod1, mod2, mod3}
	assert.Equal(t, List{mod2, mod1, mod3}, mods.OrderByIDs(id.ModelIDList{mod2.ID(), mod1.ID(), mod3.ID()}))
	assert.Equal(t, id.ProjectIDList{pid}, mods.Projects())
}

func TestList_Remove(t *testing.T) {
	pid := id.NewProjectID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	sid3 := id.NewSchemaID()
	mod1 := New().NewID().Project(pid).Schema(sid1).Key(key.New("key1")).Order(0).MustBuild()
	mod2 := New().NewID().Project(pid).Schema(sid2).Key(key.New("key2")).Order(1).MustBuild()
	mod3 := New().NewID().Project(pid).Schema(sid3).Key(key.New("key3")).Order(2).MustBuild()
	mods := List{mod1, mod2, mod3}
	assert.Equal(t, List{mod1, mod3}, mods.Remove(mod2.ID()))
	assert.Equal(t, List{mod1, mod2}, mods.Remove(mod3.ID()))
	assert.Equal(t, List{mod2, mod3}, mods.Remove(mod1.ID()))
}
