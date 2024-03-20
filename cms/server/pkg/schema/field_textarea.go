package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldTextArea struct {
	s *FieldString
}

func NewTextArea(maxLength *int) *FieldTextArea {
	return &FieldTextArea{
		s: NewString(value.TypeTextArea, maxLength),
	}
}

func (f *FieldTextArea) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:        f.Type(),
		textArea: f,
	}
}

func (f *FieldTextArea) MaxLength() *int {
	return f.s.MaxLength()
}

func (f *FieldTextArea) Type() value.Type {
	return value.TypeTextArea
}

func (f *FieldTextArea) Clone() *FieldTextArea {
	if f == nil {
		return nil
	}
	return &FieldTextArea{
		s: f.s.Clone(),
	}
}

func (f *FieldTextArea) Validate(v *value.Value) error {
	return f.s.Validate(v)
}

func (f *FieldTextArea) ValidateMultiple(v *value.Multiple) error {
	return nil
}
