package workspacesettings

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_SetTiles(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	r := NewResource(ResourceTypeTile, tt, nil)
	tiles := NewResourceList([]*Resource{r}, rid.Ref(), lo.ToPtr(true))
	ws := &WorkspaceSettings{}
	ws.SetTiles(tiles)
	assert.Equal(t, tiles, ws.Tiles())
	ws.SetTiles(nil)
	assert.Nil(t, ws.Tiles())
}

func TestWorkspaceSettings_SetTerrains(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	r := NewResource(ResourceTypeTile, tt, nil)
	terrains := NewResourceList([]*Resource{r}, rid.Ref(), lo.ToPtr(true))
	ws := &WorkspaceSettings{}
	ws.SetTerrains(terrains)
	assert.Equal(t, terrains, ws.Terrains())
	ws.SetTerrains(nil)
	assert.Nil(t, ws.Terrains())
}

func TestWorkspaceSettings_SetResources(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	r := NewResource(ResourceTypeTile, tt, nil)
	rs := []*Resource{r}
	ws := &ResourceList{}
	ws.SetResources(rs)
	assert.Equal(t, rs, ws.Resources())
}

func TestWorkspaceSettings_SetSelectedResource(t *testing.T) {
	rid := NewResourceID()
	ws := &ResourceList{}
	ws.SetSelectedResource(rid.Ref())
	assert.Equal(t, rid.Ref(), ws.SelectedResource())
}

func TestWorkspaceSettings_SetEnabled(t *testing.T) {
	ws := &ResourceList{}
	e := lo.ToPtr(true)
	ws.SetEnabled(e)
	assert.Equal(t, e, ws.Enabled())
}

func TestWorkspaceSettings_Clone(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	r := NewResource(ResourceTypeTile, tt, nil)
	rid2 := NewResourceID()
	pp2 := NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt2 := NewTerrainResource(rid, TerrainTypeCesiumIon, pp2)
	r2 := NewResource(ResourceTypeTerrain, nil, tt2)
	tiles := NewResourceList([]*Resource{r}, rid.Ref(), lo.ToPtr(true))
	terrains := NewResourceList([]*Resource{r2}, rid2.Ref(), lo.ToPtr(true))
	ws := New().NewID().Tiles(tiles).Terrains(terrains).MustBuild()
	got := ws.Clone()
	assert.Equal(t, ws, got)
	assert.NotSame(t, ws, got)
	assert.NotSame(t, ws.tiles, got.tiles)
	assert.NotSame(t, ws.terrains, got.terrains)
	assert.Nil(t, (*WorkspaceSettings)(nil).Clone())
}
