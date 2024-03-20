package request

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestList_CloseAll(t *testing.T) {
	item, _ := NewItem(id.NewItemID())

	req1 := New().
		NewID().
		Workspace(accountdomain.NewWorkspaceID()).
		Project(id.NewProjectID()).
		CreatedBy(accountdomain.NewUserID()).
		Thread(id.NewThreadID()).
		Items(ItemList{item}).
		Title("foo").
		MustBuild()

	req2 := New().
		NewID().
		Workspace(accountdomain.NewWorkspaceID()).
		Project(id.NewProjectID()).
		CreatedBy(accountdomain.NewUserID()).
		Thread(id.NewThreadID()).
		Items(ItemList{item}).
		Title("hoge").
		MustBuild()

	list := List{req1, req2}
	list.UpdateStatus(StateClosed)
	for _, request := range list {
		assert.Equal(t, StateClosed, request.State())
	}
}
