package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldRichText struct {
	s *FieldString
}

func NewRichText(maxLength *int) *FieldRichText {
	return &FieldRichText{
		s: NewString(value.TypeRichText, maxLength),
	}
}

func (f *FieldRichText) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:        f.Type(),
		richText: f,
	}
}

func (f *FieldRichText) MaxLength() *int {
	return f.s.MaxLength()
}

func (f *FieldRichText) Type() value.Type {
	return value.TypeRichText
}

func (f *FieldRichText) Clone() *FieldRichText {
	if f == nil {
		return nil
	}
	return &FieldRichText{
		s: f.s.Clone(),
	}
}

func (f *FieldRichText) Validate(v *value.Value) error {
	return f.s.Validate(v)
}

func (f *FieldRichText) ValidateMultiple(v *value.Multiple) error {
	return nil
}
