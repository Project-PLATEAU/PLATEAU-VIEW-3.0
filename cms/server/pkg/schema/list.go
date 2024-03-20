package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type List []*Schema

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Schema) int {
		return a.ID().Compare(b.ID())
	})
	return m
}

func (l List) Clone() List {
	return util.Map(l, func(s *Schema) *Schema { return s.Clone() })
}

func (l List) Fields() FieldList {
	var fields []*Field
	for _, s := range l {
		fields = append(fields, s.Fields()...)
	}
	return fields
}

func (l List) Schema(sID *id.SchemaID) *Schema {
	if sID == nil {
		return nil
	}
	s, _ := lo.Find(l, func(s *Schema) bool {
		return s.ID() == *sID
	})
	return s
}

type FieldList []*Field

func (l FieldList) Find(fid FieldID) *Field {
	f, _ := lo.Find(l, func(f *Field) bool {
		return f.ID() == fid
	})
	return f
}

func (l FieldList) SortByID() FieldList {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Field) int {
		return a.ID().Compare(b.ID())
	})
	return m
}

func (l FieldList) Clone() FieldList {
	return util.Map(l, func(f *Field) *Field { return f.Clone() })
}

func (l FieldList) IDs() (ids id.FieldIDList) {
	for _, sf := range l {
		ids = ids.Add(sf.ID())
	}
	return
}

func (l FieldList) Ordered() FieldList {
	o := slices.Clone(l)
	slices.SortFunc(o, func(a, b *Field) int {
		return a.Order() - b.Order()
	})
	return o
}

func (l FieldList) Count() int {
	return len(l)
}
