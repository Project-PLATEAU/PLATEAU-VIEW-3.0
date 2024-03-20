package asset

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

type ID = id.AssetID
type IDList = id.AssetIDList
type ProjectID = id.ProjectID
type UserID = accountdomain.UserID
type ThreadID = id.ThreadID
type IntegrationID = id.IntegrationID

var NewID = id.NewAssetID
var NewProjectID = id.NewProjectID
var NewUserID = accountdomain.NewUserID
var NewThreadID = id.NewThreadID
var NewIntegrationID = id.NewIntegrationID

var MustID = id.MustAssetID
var MustProjectID = id.MustProjectID
var MustUserID = id.MustUserID
var MustThreadID = id.MustThreadID

var IDFrom = id.AssetIDFrom
var ProjectIDFrom = id.ProjectIDFrom
var UserIDFrom = accountdomain.UserIDFrom
var ThreadIDFrom = id.ThreadIDFrom

var IDFromRef = id.AssetIDFromRef
var ProjectIDFromRef = id.ProjectIDFromRef
var UserIDFromRef = accountdomain.UserIDFromRef
var ThreadIDFromRef = id.ThreadIDFromRef

var ErrInvalidID = id.ErrInvalidID
