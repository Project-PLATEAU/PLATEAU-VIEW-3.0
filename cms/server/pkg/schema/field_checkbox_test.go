package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestNewCheckbox(t *testing.T) {
	assert.Equal(t, &FieldCheckbox{}, NewCheckbox())
}

func TestFieldCheckbox_Type(t *testing.T) {
	assert.Equal(t, value.TypeCheckbox, (&FieldCheckbox{}).Type())
}

func TestFieldCheckbox_TypeProperty(t *testing.T) {
	f := FieldCheckbox{}
	assert.Equal(t, &TypeProperty{
		t:        f.Type(),
		checkbox: &f,
	}, (&f).TypeProperty())
}

func TestFieldCheckbox_Clone(t *testing.T) {
	assert.Nil(t, (*FieldCheckbox)(nil).Clone())
	assert.Equal(t, &FieldCheckbox{}, (&FieldCheckbox{}).Clone())
}

func TestFieldCheckbox_Validate(t *testing.T) {
	assert.NoError(t, (&FieldCheckbox{}).Validate(value.TypeCheckbox.Value(true)))
	assert.Equal(t, ErrInvalidValue, (&FieldCheckbox{}).Validate(value.TypeText.Value("")))
}
