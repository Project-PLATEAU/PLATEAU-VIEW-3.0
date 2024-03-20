package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldCheckbox struct {
}

func NewCheckbox() *FieldCheckbox {
	return &FieldCheckbox{}
}

func (f *FieldCheckbox) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:        f.Type(),
		checkbox: f,
	}
}

func (f *FieldCheckbox) Type() value.Type {
	return value.TypeCheckbox
}

func (f *FieldCheckbox) Clone() *FieldCheckbox {
	if f == nil {
		return nil
	}
	return &FieldCheckbox{}
}

func (f *FieldCheckbox) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Checkbox: func(a value.Bool) {
			// ok
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}
