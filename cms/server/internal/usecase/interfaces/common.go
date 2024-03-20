package interfaces

import (
	"github.com/reearth/reearthx/account/accountusecase/accountinterfaces"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

type ListOperation string

var (
	ErrOperationDenied error = rerror.NewE(i18n.T("operation denied"))
	ErrInvalidOperator error = rerror.NewE(i18n.T("invalid operator"))
)

type Container struct {
	Asset             Asset
	Workspace         accountinterfaces.Workspace
	WorkspaceSettings WorkspaceSettings
	User              accountinterfaces.User
	Item              Item
	View              View
	Project           Project
	Request           Request
	Model             Model
	Schema            Schema
	Integration       Integration
	Thread            Thread
	Group             Group
}
