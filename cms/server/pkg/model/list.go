package model

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type List []*Model

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Model) int {
		return a.ID().Compare(b.ID())
	})
	return m
}

func (l List) Projects() id.ProjectIDList {
	return lo.Uniq(lo.FilterMap(l, func(m *Model, _ int) (id.ProjectID, bool) {
		if m == nil {
			return id.ProjectID{}, false
		}
		return m.Project(), true
	}))
}
func (l List) Clone() List {
	return util.Map(l, func(m *Model) *Model { return m.Clone() })
}

func (l List) OrderByIDs(ids id.ModelIDList) List {
	var res List
	for i, mid := range ids {
		for _, model := range l {
			if model.ID() == mid {
				model.SetOrder(i)
				res = append(res, model)
				break
			}
		}
	}
	return res
}

func (l List) Ordered() List {
	res := slices.Clone(l)
	slices.SortFunc(res, func(a, b *Model) int {
		return a.Order() - b.Order()
	})
	return res
}

func (l List) Remove(mid id.ModelID) List {
	ordered := slices.Clone(l).Ordered()
	var index int
	for i, model := range ordered {
		if mid == model.ID() {
			index = i
			break
		}
	}
	if index > len(l) {
		return l
	}
	for _, m2 := range ordered[index:] {
		m2.order -= 1
	}
	return append(ordered[:index], ordered[index+1:]...)
}
