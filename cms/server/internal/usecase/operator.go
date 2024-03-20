package usecase

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
)

type Operator struct {
	Integration          *integration.ID
	Machine              bool
	Lang                 string
	ReadableProjects     project.IDList
	WritableProjects     project.IDList
	OwningProjects       project.IDList
	MaintainableProjects project.IDList

	AcOperator *accountusecase.Operator
}

type Ownable interface {
	User() *accountdomain.UserID
	Integration() *id.IntegrationID
	Project() id.ProjectID
}

func (o *Operator) Workspaces(r workspace.Role) []accountdomain.WorkspaceID {
	if o == nil {
		return nil
	}
	if r == workspace.RoleReader {
		return o.AcOperator.ReadableWorkspaces
	}
	if r == workspace.RoleWriter {
		return o.AcOperator.WritableWorkspaces
	}
	if r == workspace.RoleMaintainer {
		return o.AcOperator.MaintainableWorkspaces
	}
	if r == workspace.RoleOwner {
		return o.AcOperator.OwningWorkspaces
	}
	return nil
}

func (o *Operator) AllReadableWorkspaces() user.WorkspaceIDList {
	if o == nil {
		return nil
	}
	return append(o.AcOperator.ReadableWorkspaces, o.AllWritableWorkspaces()...)
}

func (o *Operator) AllWritableWorkspaces() user.WorkspaceIDList {
	return append(o.AcOperator.WritableWorkspaces, o.AllMaintainingWorkspaces()...)
}

func (o *Operator) AllMaintainingWorkspaces() user.WorkspaceIDList {
	return append(o.AcOperator.MaintainableWorkspaces, o.AllOwningWorkspaces()...)
}

func (o *Operator) AllOwningWorkspaces() user.WorkspaceIDList {
	return o.AcOperator.OwningWorkspaces
}

func (o *Operator) IsReadableWorkspace(workspace ...accountdomain.WorkspaceID) bool {
	return o.AllReadableWorkspaces().Intersect(workspace).Len() > 0
}

func (o *Operator) IsWritableWorkspace(workspace ...accountdomain.WorkspaceID) bool {
	return o.AllWritableWorkspaces().Intersect(workspace).Len() > 0
}

func (o *Operator) IsMaintainingWorkspace(workspace ...accountdomain.WorkspaceID) bool {
	return o.AllMaintainingWorkspaces().Intersect(workspace).Len() > 0
}

func (o *Operator) IsOwningWorkspace(workspace ...accountdomain.WorkspaceID) bool {
	return o.AllOwningWorkspaces().Intersect(workspace).Len() > 0
}

func (o *Operator) AddNewWorkspace(workspace accountdomain.WorkspaceID) {
	o.AcOperator.OwningWorkspaces = append(o.AcOperator.OwningWorkspaces, workspace)
}

func (o *Operator) Projects(r workspace.Role) project.IDList {
	if o == nil {
		return nil
	}
	if r == workspace.RoleReader {
		return o.ReadableProjects
	}
	if r == workspace.RoleWriter {
		return o.WritableProjects
	}
	if r == workspace.RoleMaintainer {
		return o.MaintainableProjects
	}
	if r == workspace.RoleOwner {
		return o.OwningProjects
	}
	return nil
}

func (o *Operator) AllReadableProjects() project.IDList {
	return append(o.ReadableProjects, o.AllWritableProjects()...)
}

func (o *Operator) AllWritableProjects() project.IDList {
	return append(o.WritableProjects, o.AllMaintainableProjects()...)
}

func (o *Operator) AllMaintainableProjects() project.IDList {
	return append(o.MaintainableProjects, o.AllOwningProjects()...)
}

func (o *Operator) AllOwningProjects() project.IDList {
	return o.OwningProjects
}

func (o *Operator) IsReadableProject(projects ...project.ID) bool {
	return o.AllReadableProjects().Intersect(projects).Len() > 0
}

func (o *Operator) IsWritableProject(projects ...project.ID) bool {
	return o.AllWritableProjects().Intersect(projects).Len() > 0
}

func (o *Operator) IsMaintainingProject(projects ...project.ID) bool {
	return o.AllMaintainableProjects().Intersect(projects).Len() > 0
}

func (o *Operator) IsOwningProject(projects ...project.ID) bool {
	return o.AllOwningProjects().Intersect(projects).Len() > 0
}

func (o *Operator) AddNewProject(p project.ID) {
	o.OwningProjects = append(o.OwningProjects, p)
}

func (o *Operator) Operator() operator.Operator {
	var eOp operator.Operator
	if o.AcOperator.User != nil {
		eOp = operator.OperatorFromUser(*o.AcOperator.User)
	}
	if o.Integration != nil {
		eOp = operator.OperatorFromIntegration(*o.Integration)
	}
	if o.Machine {
		eOp = operator.OperatorFromMachine()
	}
	return eOp
}

func (o *Operator) CanUpdate(obj Ownable) bool {
	isWriter := o.IsWritableProject(obj.Project())
	isMaintainer := o.IsMaintainingProject(obj.Project())
	return isMaintainer || (isWriter && o.Owns(obj)) || o.Machine
}

func (o *Operator) Owns(obj Ownable) bool {
	return (o.AcOperator.User != nil && obj.User() != nil && *o.AcOperator.User == *obj.User()) ||
		(o.Integration != nil && obj.Integration() != nil && *o.Integration == *obj.Integration())
}

func (o *Operator) RoleByProject(pid id.ProjectID) workspace.Role {
	if o.IsOwningProject(pid) {
		return workspace.RoleOwner
	}
	if o.IsMaintainingProject(pid) {
		return workspace.RoleMaintainer
	}
	if o.IsWritableProject(pid) {
		return workspace.RoleWriter
	}
	if o.IsReadableProject(pid) {
		return workspace.RoleReader
	}
	return ""
}
