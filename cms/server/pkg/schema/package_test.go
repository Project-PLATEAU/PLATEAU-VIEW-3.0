package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/stretchr/testify/assert"
)

func TestPackage_New(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Equal(t, p, &Package{
		schema:       s,
		metaSchema:   meta,
		groupSchemas: groupSchemas,
	})
}

func TestPackage_Schema(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Equal(t, s, p.Schema())
}

func TestPackage_MetaSchema(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Equal(t, meta, p.MetaSchema())
}

func TestPackage_GroupSchemas(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Equal(t, List{groupSchemas[gID]}, p.GroupSchemas())
}

func TestPackage_GroupSchema(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Equal(t, groupSchemas[gID], p.GroupSchema(gID))
	assert.Nil(t, p.GroupSchema(id.NewGroupID()))
}

func TestPackage_Field(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Nil(t, p.Field(id.NewFieldID()))
	assert.Equal(t, f1, p.Field(f1.ID()))
	assert.Equal(t, f2, p.Field(f2.ID()))
	assert.Equal(t, f3, p.Field(f3.ID()))
}
