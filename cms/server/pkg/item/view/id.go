package view

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

type ID = id.ViewID
type IDList = id.ViewIDList
type UserID = accountdomain.UserID
type ProjectID = id.ProjectID
type ModelID = id.ModelID
type SchemaID = id.SchemaID

var NewID = id.NewViewID
var NewProjectID = id.NewProjectID
var NewModelID = id.NewModelID
var NewSchemaID = id.NewSchemaID
var NewUserID = accountdomain.NewUserID
