package thread

import (
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type List []*Thread

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Thread) int {
		return a.ID().Compare(b.ID())
	})
	return m
}

func (l List) Clone() List {
	return util.Map(l, func(th *Thread) *Thread { return th.Clone() })
}
