package thread

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

type ID = id.ThreadID
type CommentID = id.CommentID
type UserID = accountdomain.UserID
type WorkspaceID = id.WorkspaceID

var NewID = id.NewThreadID
var NewCommentID = id.NewCommentID
var NewUserID = accountdomain.NewUserID
var NewWorkspaceID = accountdomain.NewWorkspaceID

var MustID = id.MustThreadID
var MustCommentID = id.MustCommentID
var MustUserID = id.MustUserID
var MustWorkspaceID = id.MustWorkspaceID

var IDFrom = id.ThreadIDFrom
var CommentIDFrom = id.CommentIDFrom
var UserIDFrom = accountdomain.UserIDFrom
var WorkspaceIDFrom = id.WorkspaceIDFrom

var IDFromRef = id.ThreadIDFromRef
var CommentIDFromRef = id.CommentIDFromRef
var UserIDFromRef = accountdomain.UserIDFromRef
var WorkspaceIDFromRef = id.WorkspaceIDFromRef

var ErrInvalidID = id.ErrInvalidID
