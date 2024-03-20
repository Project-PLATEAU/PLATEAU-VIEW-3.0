package workspacesettings

import (
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type WorkspaceSettings struct {
	id       ID
	tiles    *ResourceList
	terrains *ResourceList
}

func (ws *WorkspaceSettings) ID() ID {
	return ws.id
}

func (ws *WorkspaceSettings) Tiles() *ResourceList {
	if ws.tiles == nil {
		return nil
	}
	return ws.tiles
}

func (ws *WorkspaceSettings) SetTiles(wl *ResourceList) {
	ws.tiles = util.CloneRef(wl)
}

func (ws *WorkspaceSettings) Terrains() *ResourceList {
	if ws.terrains == nil {
		return nil
	}
	return ws.terrains
}

func (ws *WorkspaceSettings) SetTerrains(wl *ResourceList) {
	ws.terrains = util.CloneRef(wl)
}

func (ws *WorkspaceSettings) Clone() *WorkspaceSettings {
	if ws == nil {
		return nil
	}

	res := &WorkspaceSettings{
		id: ws.id.Clone(),
	}
	if ws.tiles != nil {
		res.tiles = &ResourceList{
			resources:        slices.Clone(ws.tiles.resources),
			selectedResource: ws.tiles.selectedResource.CloneRef(),
			enabled:          util.CloneRef(ws.tiles.enabled),
		}
	}
	if ws.terrains != nil {
		res.terrains = &ResourceList{
			resources:        slices.Clone(ws.terrains.resources),
			selectedResource: ws.terrains.selectedResource.CloneRef(),
			enabled:          util.CloneRef(ws.terrains.enabled),
		}
	}

	return res
}