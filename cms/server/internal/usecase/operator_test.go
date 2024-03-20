package usecase

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/stretchr/testify/assert"
)

func TestOperator_Workspaces(t *testing.T) {
	u := accountdomain.NewUserID()
	w1, w2, w3, w4 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	op := Operator{
		AcOperator: &accountusecase.Operator{
			User:                   &u,
			ReadableWorkspaces:     id.WorkspaceIDList{w1},
			WritableWorkspaces:     id.WorkspaceIDList{w2},
			MaintainableWorkspaces: id.WorkspaceIDList{w3},
			OwningWorkspaces:       id.WorkspaceIDList{w4},
		},
		Integration: nil,
	}

	assert.Equal(t, op.Workspaces(workspace.RoleReader), []accountdomain.WorkspaceID{w1})
	assert.Equal(t, op.Workspaces(workspace.RoleWriter), []accountdomain.WorkspaceID{w2})
	assert.Equal(t, op.Workspaces(workspace.RoleMaintainer), []accountdomain.WorkspaceID{w3})
	assert.Equal(t, op.Workspaces(workspace.RoleOwner), []accountdomain.WorkspaceID{w4})
	assert.Nil(t, op.Workspaces(""))
	assert.Nil(t, (*Operator)(nil).Workspaces(""))

	assert.Equal(t, op.AllReadableWorkspaces(), id.WorkspaceIDList{w1, w2, w3, w4})
	assert.Equal(t, op.AllWritableWorkspaces(), id.WorkspaceIDList{w2, w3, w4})
	assert.Equal(t, op.AllMaintainingWorkspaces(), id.WorkspaceIDList{w3, w4})
	assert.Equal(t, op.AllOwningWorkspaces(), id.WorkspaceIDList{w4})

	assert.True(t, op.IsReadableWorkspace(w1))
	assert.True(t, op.IsReadableWorkspace(w2))
	assert.True(t, op.IsReadableWorkspace(w3))
	assert.True(t, op.IsReadableWorkspace(w4))
	assert.False(t, op.IsReadableWorkspace(accountdomain.NewWorkspaceID()))

	assert.False(t, op.IsWritableWorkspace(w1))
	assert.True(t, op.IsWritableWorkspace(w2))
	assert.True(t, op.IsWritableWorkspace(w3))
	assert.True(t, op.IsWritableWorkspace(w4))
	assert.False(t, op.IsWritableWorkspace(accountdomain.NewWorkspaceID()))

	assert.False(t, op.IsMaintainingWorkspace(w1))
	assert.False(t, op.IsMaintainingWorkspace(w2))
	assert.True(t, op.IsMaintainingWorkspace(w3))
	assert.True(t, op.IsMaintainingWorkspace(w4))
	assert.False(t, op.IsMaintainingWorkspace(accountdomain.NewWorkspaceID()))

	assert.False(t, op.IsOwningWorkspace(w1))
	assert.False(t, op.IsOwningWorkspace(w2))
	assert.False(t, op.IsOwningWorkspace(w3))
	assert.True(t, op.IsOwningWorkspace(w4))
	assert.False(t, op.IsOwningWorkspace(accountdomain.NewWorkspaceID()))

	w5 := accountdomain.NewWorkspaceID()
	op.AddNewWorkspace(w5)
	assert.Equal(t, user.WorkspaceIDList{w4, w5}, op.AcOperator.OwningWorkspaces)
}

func TestOperator_Projects(t *testing.T) {
	u := accountdomain.NewUserID()
	p1, p2, p3, p4 := id.NewProjectID(), id.NewProjectID(), id.NewProjectID(), id.NewProjectID()
	op := Operator{
		AcOperator: &accountusecase.Operator{
			User: &u,
		},
		Integration:          nil,
		ReadableProjects:     id.ProjectIDList{p1},
		WritableProjects:     id.ProjectIDList{p2},
		MaintainableProjects: id.ProjectIDList{p3},
		OwningProjects:       id.ProjectIDList{p4},
	}

	assert.Equal(t, op.Projects(workspace.RoleReader), project.IDList{p1})
	assert.Equal(t, op.Projects(workspace.RoleWriter), project.IDList{p2})
	assert.Equal(t, op.Projects(workspace.RoleMaintainer), project.IDList{p3})
	assert.Equal(t, op.Projects(workspace.RoleOwner), project.IDList{p4})
	assert.Nil(t, ((*Operator)(nil)).Projects(workspace.RoleReader))
	assert.Nil(t, op.Projects(""))

	assert.Equal(t, op.AllReadableProjects(), id.ProjectIDList{p1, p2, p3, p4})
	assert.Equal(t, op.AllWritableProjects(), id.ProjectIDList{p2, p3, p4})
	assert.Equal(t, op.AllMaintainableProjects(), id.ProjectIDList{p3, p4})
	assert.Equal(t, op.AllOwningProjects(), id.ProjectIDList{p4})

	assert.True(t, op.IsReadableProject(p1))
	assert.True(t, op.IsReadableProject(p2))
	assert.True(t, op.IsReadableProject(p3))
	assert.True(t, op.IsReadableProject(p4))
	assert.False(t, op.IsReadableProject(id.NewProjectID()))

	assert.False(t, op.IsWritableProject(p1))
	assert.True(t, op.IsWritableProject(p2))
	assert.True(t, op.IsWritableProject(p3))
	assert.True(t, op.IsWritableProject(p4))
	assert.False(t, op.IsWritableProject(id.NewProjectID()))

	assert.False(t, op.IsMaintainingProject(p1))
	assert.False(t, op.IsMaintainingProject(p2))
	assert.True(t, op.IsMaintainingProject(p3))
	assert.True(t, op.IsMaintainingProject(p4))
	assert.False(t, op.IsMaintainingProject(id.NewProjectID()))

	assert.False(t, op.IsOwningProject(p1))
	assert.False(t, op.IsOwningProject(p2))
	assert.False(t, op.IsOwningProject(p3))
	assert.True(t, op.IsOwningProject(p4))
	assert.False(t, op.IsOwningProject(id.NewProjectID()))

	p5 := id.NewProjectID()
	op.AddNewProject(p5)
	assert.Equal(t, project.IDList{p4, p5}, op.OwningProjects)
}

func TestOperator_Operator(t *testing.T) {
	uId := accountdomain.NewUserID()
	op := Operator{
		Integration: nil,
		AcOperator: &accountusecase.Operator{
			User: &uId,
		},
	}

	eOp := op.Operator()

	assert.NotNil(t, eOp.User())
	assert.Nil(t, eOp.Integration())
	assert.Equal(t, &uId, eOp.User())
	assert.False(t, eOp.Machine())

	iId := id.NewIntegrationID()

	op = Operator{
		Integration: &iId,
		AcOperator: &accountusecase.Operator{
			User: nil,
		},
	}

	eOp = op.Operator()

	assert.Nil(t, eOp.User())
	assert.NotNil(t, eOp.Integration())
	assert.Equal(t, &iId, eOp.Integration())
	assert.False(t, eOp.Machine())

	op = Operator{
		AcOperator: &accountusecase.Operator{},
		Machine:    true,
	}

	eOp = op.Operator()

	assert.Nil(t, eOp.User())
	assert.Nil(t, eOp.Integration())
	assert.True(t, eOp.Machine())
}

type ownable struct {
	U *accountdomain.UserID
	I *id.IntegrationID
	P id.ProjectID
}

func (o ownable) User() *accountdomain.UserID {
	return o.U
}
func (o ownable) Integration() *id.IntegrationID {
	return o.I
}
func (o ownable) Project() id.ProjectID {
	return o.P
}

func TestOperator_Checks(t *testing.T) {
	uId := accountdomain.NewUserID()
	pId := id.NewProjectID()
	op := Operator{
		AcOperator: &accountusecase.Operator{
			User: &uId,
		},
		Integration:      nil,
		WritableProjects: project.IDList{pId},
	}

	obj := ownable{U: &uId, P: pId}

	assert.True(t, op.Owns(obj))

	assert.True(t, op.CanUpdate(obj))
}

func TestOperator_RoleByProject(t *testing.T) {
	// Owner
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()
	operator := &Operator{
		AcOperator: &accountusecase.Operator{
			User: &uid,
		},
		Integration:    nil,
		OwningProjects: project.IDList{pid},
	}
	role := operator.RoleByProject(pid)
	expectedRole := workspace.RoleOwner
	assert.Equal(t, expectedRole, role)

	// Maintainer
	pid2 := id.NewProjectID()
	uid2 := accountdomain.NewUserID()
	operator2 := &Operator{
		AcOperator: &accountusecase.Operator{
			User: &uid2,
		},
		Integration:          nil,
		MaintainableProjects: project.IDList{pid2},
	}
	role2 := operator2.RoleByProject(pid2)
	expectedRole2 := workspace.RoleMaintainer
	assert.Equal(t, expectedRole2, role2)

	// Writer
	pid3 := id.NewProjectID()
	uid3 := accountdomain.NewUserID()
	operator3 := &Operator{
		AcOperator: &accountusecase.Operator{
			User: &uid3,
		}, Integration: nil,
		WritableProjects: project.IDList{pid3},
	}
	role3 := operator3.RoleByProject(pid3)
	expectedRole3 := workspace.RoleWriter
	assert.Equal(t, expectedRole3, role3)

	// Reader
	pid4 := id.NewProjectID()
	uid4 := accountdomain.NewUserID()
	operator4 := &Operator{
		AcOperator: &accountusecase.Operator{
			User: &uid4,
		},
		Integration:      nil,
		ReadableProjects: project.IDList{pid4},
	}
	role4 := operator4.RoleByProject(pid4)
	expectedRole4 := workspace.RoleReader
	assert.Equal(t, expectedRole4, role4)

	// No role
	pid5 := id.NewProjectID()
	operator5 := &Operator{}
	role5 := operator5.RoleByProject(pid5)
	expectedRole5 := workspace.Role("")
	assert.Equal(t, expectedRole5, role5)
}
