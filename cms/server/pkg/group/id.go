package group

import "github.com/reearth/reearth-cms/server/pkg/id"

type ID = id.GroupID
type ProjectID = id.ProjectID
type SchemaID = id.SchemaID

var NewID = id.NewGroupID
var MustID = id.MustGroupID
var IDFrom = id.GroupIDFrom
var IDFromRef = id.GroupIDFromRef
var ErrInvalidID = id.ErrInvalidID
