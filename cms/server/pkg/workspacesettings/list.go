package workspacesettings

import (
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type List []*WorkspaceSettings

func (l List) SortByID() List {
	ws := slices.Clone(l)
	slices.SortFunc(ws, func(a, b *WorkspaceSettings) int {
		return a.ID().Compare(b.ID())
	})
	return ws
}

func (l List) Clone() List {
	return util.Map(l, func(ws *WorkspaceSettings) *WorkspaceSettings { return ws.Clone() })
}
