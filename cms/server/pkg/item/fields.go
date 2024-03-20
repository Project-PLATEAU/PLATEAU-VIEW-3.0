package item

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type Fields []*Field

type FieldMap map[FieldID]*Field

func (f Fields) Map() FieldMap {
	m := make(map[FieldID]*Field)
	for _, field := range f {
		if field != nil {
			m[field.FieldID()] = field
		}
	}
	return m
}

func (f Fields) Field(fID FieldID) *Field {
	ff, _ := lo.Find(f, func(g *Field) bool {
		return g.FieldID() == fID
	})
	return ff
}

func (f Fields) FieldsByType(t value.Type) []*Field {
	fields := slices.Clone(f)
	return lo.Filter(fields, func(f *Field, _ int) bool {
		return f.Type() == t
	})
}

func (f Fields) FieldsByGroup(iid id.ItemGroupID) []*Field {
	fields := slices.Clone(f)
	return lo.Filter(fields, func(f *Field, _ int) bool {
		return f.ItemGroup() != nil && *f.ItemGroup() == iid
	})
}
