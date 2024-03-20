package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewReference(t *testing.T) {
	m := id.NewModelID()
	sid := id.NewSchemaID()
	cf := id.NewFieldID().Ref()
	assert.Equal(t, &FieldReference{modelID: m, schemaID: sid, correspondingFieldID: cf}, NewReference(m, sid, cf, nil))
}

func TestFieldReference_CorrespondingField(t *testing.T) {
	m := id.NewModelID()
	sid := id.NewSchemaID()
	cf := &CorrespondingField{}
	f := NewReference(m, sid, id.NewFieldID().Ref(), cf)
	assert.Equal(t, cf, f.CorrespondingField())
}

func TestFieldReference_CorrespondingFieldID(t *testing.T) {
	m := id.NewModelID()
	s := id.NewSchemaID()
	cf := id.NewFieldID().Ref()
	f := NewReference(m, s, cf, nil)
	assert.Equal(t, cf, f.CorrespondingFieldID())
}

func TestFieldReference_Model(t *testing.T) {
	m := id.NewModelID()
	s := id.NewSchemaID()
	f := NewReference(m, s, nil, nil)
	assert.Equal(t, m, f.Model())
}

func TestFieldReference_Type(t *testing.T) {
	assert.Equal(t, value.TypeReference, (&FieldReference{}).Type())
}

func TestFieldReference_TypeProperty(t *testing.T) {
	f := FieldReference{}
	assert.Equal(t, &TypeProperty{
		t:         f.Type(),
		reference: &f,
	}, (&f).TypeProperty())
}

func TestFieldReference_Clone(t *testing.T) {
	m := id.NewModelID()
	cf := id.NewFieldID().Ref()
	assert.Nil(t, (*FieldReference)(nil).Clone())
	assert.Equal(t, &FieldReference{modelID: m, correspondingFieldID: cf}, (&FieldReference{modelID: m, correspondingFieldID: cf}).Clone())
}

func TestFieldReference_Validate(t *testing.T) {
	aid := id.NewItemID()
	assert.NoError(t, (&FieldReference{}).Validate(value.TypeReference.Value(aid)))
	assert.Equal(t, ErrInvalidValue, (&FieldReference{}).Validate(value.TypeText.Value("")))
}
