package group

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&Group{id: id2},
		&Group{id: id1},
	}
	res := list.SortByID()
	assert.Equal(t, List{
		&Group{id: id1},
		&Group{id: id2},
	}, res)
	// test whether original list is not modified
	assert.Equal(t, List{
		&Group{id: id2},
		&Group{id: id1},
	}, list)
}

func TestList_Clone(t *testing.T) {
	id := NewID()
	list := List{&Group{id: id}}
	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])

	got[0].id = NewID()
	// test whether original list is not modified
	assert.Equal(t, list, List{&Group{id: id}})
}
