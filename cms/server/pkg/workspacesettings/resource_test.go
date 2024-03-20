package workspacesettings

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_NewResource(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	r := NewResource(ResourceTypeTile, tt, nil)
	assert.Equal(t, r.ResourceType(), ResourceTypeTile)
	assert.Equal(t, r.Tile(), tt)
	assert.Nil(t, r.Terrain())
	r.SetResourceType(ResourceTypeTerrain)
	assert.Equal(t, r.ResourceType(), ResourceTypeTerrain)
	r.SetTile(nil)
	assert.Nil(t, r.Tile())
	rid2 := NewResourceID()
	pp2 := NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt2 := NewTerrainResource(rid2, TerrainTypeCesiumIon, pp2)
	r.SetTerrain(tt2)
	assert.Equal(t, r.Terrain(), tt2)
}