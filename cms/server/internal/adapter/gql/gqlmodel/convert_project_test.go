package gqlmodel

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/stretchr/testify/assert"
)

func TestConvertProject_ToProject(t *testing.T) {
	mocktime := time.Now()
	wid := accountdomain.NewWorkspaceID()
	r := []workspace.Role{workspace.RoleOwner}
	pid := id.NewProjectID()
	p := project.New().ID(pid).Workspace(wid).RequestRoles(r).UpdatedAt(mocktime.Add(-time.Second)).MustBuild()
	want := &Project{
		ID:           IDFrom(pid),
		Name:         p.Name(),
		Description:  p.Description(),
		Alias:        p.Alias(),
		WorkspaceID:  IDFrom(wid),
		Workspace:    nil,
		CreatedAt:    p.CreatedAt(),
		UpdatedAt:    p.UpdatedAt(),
		Publication:  nil,
		RequestRoles: []Role{RoleOwner},
	}
	assert.Equal(t, want, ToProject(p))

	var p2 *project.Project
	assert.Nil(t, ToProject(p2))
}
