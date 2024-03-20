package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type FieldID = id.FieldID
type WorkspaceID = id.WorkspaceID
type TagID = id.TagID
type TagIDList = id.TagIDList
type GroupID = id.GroupID
type GroupIDList = id.GroupIDList

var NewTagID = id.NewTagID
var MustTagID = id.MustTagID
var TagIDFrom = id.TagIDFrom
var TagIDFromRef = id.TagIDFromRef
var ErrInvalidTagID = id.ErrInvalidID
var NewFieldID = id.NewFieldID
var MustFieldID = id.MustFieldID
var FieldIDFrom = id.FieldIDFrom
var FieldIDFromRef = id.FieldIDFromRef
var ErrInvalidFieldID = id.ErrInvalidID

type ID = id.SchemaID
type IDList = id.SchemaIDList
type ProjectID = id.ProjectID

var NewID = id.NewSchemaID
var MustID = id.MustSchemaID
var IDFrom = id.SchemaIDFrom
var IDListFrom = id.SchemaIDListFrom
var IDFromRef = id.SchemaIDFromRef
var ErrInvalidID = id.ErrInvalidID
