package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_ToWorkspaceSettings(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt := workspacesettings.NewTileResource(rid, workspacesettings.TileTypeDefault, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt, nil)
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), lo.ToPtr(true))
	ws := workspacesettings.New().NewID().Tiles(tiles).MustBuild()

	ws2 := ToWorkspaceSettings(ws)
	assert.Equal(t, IDFrom(ws.ID()), ws2.ID)
	assert.Equal(t, ToResourceList(ws.Tiles()), ws2.Tiles)
	assert.Equal(t, ToResourceList(ws.Terrains()), ws2.Terrains)

	ws3 := ToWorkspaceSettings(nil)
	assert.Nil(t, ws3)
}

func Test_ToResourceList(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt := workspacesettings.NewTileResource(rid, workspacesettings.TileTypeDefault, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt, nil)
	rl := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), lo.ToPtr(true))
	assert.Equal(t, rl.Resources(), []*workspacesettings.Resource{r})
	assert.Equal(t, rl.SelectedResource(), rid.Ref())
	assert.Equal(t, rl.Enabled(), lo.ToPtr(true))

	rl2 := ToResourceList(nil)
	assert.Nil(t, rl2)
}

func Test_ToTileType(t *testing.T) {
	assert.Equal(t, TileTypeDefault, ToTileType(workspacesettings.TileTypeDefault))
	assert.Equal(t, TileTypeLabelled, ToTileType(workspacesettings.TileTypeLabelled))
	assert.Equal(t, TileTypeRoadMap, ToTileType(workspacesettings.TileTypeRoadMap))
	assert.Equal(t, TileTypeOpenStreetMap, ToTileType(workspacesettings.TileTypeOpenStreetMap))
	assert.Equal(t, TileTypeEsriTopography, ToTileType(workspacesettings.TileTypeESRITopography))
	assert.Equal(t, TileTypeEarthAtNight, ToTileType(workspacesettings.TileTypeEarthAtNight))
	assert.Equal(t, TileTypeJapanGsiStandardMap, ToTileType(workspacesettings.TileTypeJapanGSIStandardMap))
	assert.Equal(t, TileTypeURL, ToTileType(workspacesettings.TileTypeURL))
	assert.Equal(t, TileTypeDefault, ToTileType(workspacesettings.TileType("")))
}

func Test_ToTerrainType(t *testing.T) {
	assert.Equal(t, TerrainTypeCesiumWorldTerrain, ToTerrainType(workspacesettings.TerrainTypeCesiumWorldTerrain))
	assert.Equal(t, TerrainTypeArcGisTerrain, ToTerrainType(workspacesettings.TerrainTypeArcGISTerrain))
	assert.Equal(t, TerrainTypeCesiumIon, ToTerrainType(workspacesettings.TerrainTypeCesiumIon))
}

func Test_ToResource(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt := workspacesettings.NewTerrainResource(rid, workspacesettings.TerrainTypeArcGISTerrain, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, nil, tt)

	expected := TerrainResource{
		ID:    IDFrom(r.Terrain().ID()),
		Type:  ToTerrainType(r.Terrain().Type()),
		Props: ToCesiumResourceProps(r.Terrain().Props()),
	}

	assert.Equal(t, expected, ToResource(r))
	assert.Nil(t, ToResource(nil))
}

func Test_FromResourceList(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt := workspacesettings.NewTerrainResource(rid, workspacesettings.TerrainTypeCesiumIon, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, tt)
	rl := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), lo.ToPtr(true))

	tid := IDFrom(r.Terrain().ID())
	ri := &ResourceInput{
		Terrain: &TerrainResourceInput{
			ID:   tid,
			Type: TerrainTypeCesiumIon,
			Props: &CesiumResourcePropsInput{
				Name:                 "foo",
				URL:                  "bar",
				Image:                "baz",
				CesiumIonAssetID:     "test",
				CesiumIonAccessToken: "test",
			},
		},
	}

	expected := &ResourcesListInput{
		Resources: []*ResourceInput{
			ri,
		},
		SelectedResource: IDFromRef(rl.SelectedResource()),
		Enabled:          lo.ToPtr(true),
	}

	assert.Equal(t, rl, FromResourceList(expected))
	assert.Nil(t, FromResourceList(nil))
}

func Test_FromResource(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt := workspacesettings.NewTerrainResource(rid, workspacesettings.TerrainTypeCesiumIon, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, tt)

	tid := IDFrom(r.Terrain().ID())
	expected := &ResourceInput{
		Terrain: &TerrainResourceInput{
			ID:   tid,
			Type: TerrainTypeCesiumIon,
			Props: &CesiumResourcePropsInput{
				Name:                 "foo",
				URL:                  "bar",
				Image:                "baz",
				CesiumIonAssetID:     "test",
				CesiumIonAccessToken: "test",
			},
		},
	}

	assert.Equal(t, r, FromResource(expected))
	assert.Nil(t, FromResource(nil))

	rid2 := workspacesettings.NewResourceID()
	pp2 := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt2 := workspacesettings.NewTileResource(rid2, workspacesettings.TileTypeDefault, pp2)
	r2 := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt2, nil)

	tid2 := IDFrom(r2.Tile().ID())
	expected2 := &ResourceInput{
		Tile: &TileResourceInput{
			ID:   tid2,
			Type: TileTypeDefault,
			Props: &URLResourcePropsInput{
				Name:  "foo",
				URL:   "bar",
				Image: "baz",
			},
		},
	}

	assert.Equal(t, r2, FromResource(expected2))
	assert.Nil(t, FromResource(nil))
}

func Test_FromTerrainType(t *testing.T) {
	assert.Equal(t, workspacesettings.TerrainTypeCesiumWorldTerrain, FromTerrainType(TerrainTypeCesiumWorldTerrain))
	assert.Equal(t, workspacesettings.TerrainTypeArcGISTerrain, FromTerrainType(TerrainTypeArcGisTerrain))
	assert.Equal(t, workspacesettings.TerrainTypeCesiumIon, FromTerrainType(TerrainTypeCesiumIon))
}

func Test_FromTileType(t *testing.T) {
	assert.Equal(t, workspacesettings.TileTypeDefault, FromTileType(TileTypeDefault))
	assert.Equal(t, workspacesettings.TileTypeLabelled, FromTileType(TileTypeLabelled))
	assert.Equal(t, workspacesettings.TileTypeRoadMap, FromTileType(TileTypeRoadMap))
	assert.Equal(t, workspacesettings.TileTypeOpenStreetMap, FromTileType(TileTypeOpenStreetMap))
	assert.Equal(t, workspacesettings.TileTypeESRITopography, FromTileType(TileTypeEsriTopography))
	assert.Equal(t, workspacesettings.TileTypeEarthAtNight, FromTileType(TileTypeEarthAtNight))
	assert.Equal(t, workspacesettings.TileTypeJapanGSIStandardMap, FromTileType(TileTypeJapanGsiStandardMap))
	assert.Equal(t, workspacesettings.TileTypeURL, FromTileType(TileTypeURL))
}
