package workspacesettings

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&WorkspaceSettings{id: id2},
		&WorkspaceSettings{id: id1},
	}
	res := list.SortByID()
	assert.Equal(t, List{
		&WorkspaceSettings{id: id1},
		&WorkspaceSettings{id: id2},
	}, res)
	// test whether original list is not modified
	assert.Equal(t, List{
		&WorkspaceSettings{id: id2},
		&WorkspaceSettings{id: id1},
	}, list)
}

func TestList_Clone(t *testing.T) {
	th := New().NewID().MustBuild()

	list := List{th}
	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])
}
