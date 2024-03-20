package request

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

type ID = id.RequestID
type WorkspaceID = id.WorkspaceID
type ProjectID = id.ProjectID
type ItemID = id.ItemID
type UserID = accountdomain.UserID
type UserIDList = accountdomain.UserIDList
type ThreadID = id.ThreadID

var NewID = id.NewRequestID
var NewWorkspaceID = accountdomain.NewWorkspaceID
var NewProjectID = id.NewProjectID
var NewThreadID = id.NewThreadID
var NewUserID = accountdomain.NewUserID
var NewItemID = id.NewItemID
var MustID = id.MustRequestID
var IDFrom = id.RequestIDFrom
var IDFromRef = id.RequestIDFromRef

var ErrInvalidID = id.ErrInvalidID
