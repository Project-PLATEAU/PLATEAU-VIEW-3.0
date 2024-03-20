package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldGroup struct {
	group GroupID
}

func NewGroup(gid GroupID) *FieldGroup {
	return &FieldGroup{
		group: gid,
	}
}

func (f *FieldGroup) Group() GroupID {
	return f.group
}

func (f *FieldGroup) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:     f.Type(),
		group: f,
	}
}

func (f *FieldGroup) Type() value.Type {
	return value.TypeGroup
}

func (f *FieldGroup) Clone() *FieldGroup {
	if f == nil {
		return nil
	}
	return &FieldGroup{
		group: f.Group(),
	}
}

func (f *FieldGroup) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Group: func(a value.Group) {
			_, ok := v.ValueGroup()
			if !ok {
				err = ErrInvalidValue
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

func (f *FieldGroup) ValidateMultiple(v *value.Multiple) error {
	return nil
}
