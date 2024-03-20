package mongodoc

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_NewWorkspaceSettings(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt := workspacesettings.NewTileResource(rid, workspacesettings.TileTypeDefault, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt, nil)
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), lo.ToPtr(true))
	ws := workspacesettings.New().NewID().Tiles(tiles).MustBuild()

	wsid := ws.ID().String()
	expected := &WorkspaceSettingsDocument{
		ID:       wsid,
		Tiles:    ToResourceListDocument(ws.Tiles()),
		Terrains: ToResourceListDocument(ws.Terrains()),
	}
	res, resid := NewWorkspaceSettings(ws)

	assert.Equal(t, expected, res)
	assert.Equal(t, expected.ID, resid)
}

func Test_WorkspaceSettingsDocument_Model(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt := workspacesettings.NewTileResource(rid, workspacesettings.TileTypeDefault, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt, nil)
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), lo.ToPtr(true))
	rid2 := workspacesettings.NewResourceID()
	pp2 := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt2 := workspacesettings.NewTerrainResource(rid2, workspacesettings.TerrainTypeCesiumIon, pp2)
	r2 := workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, tt2)
	terrains := workspacesettings.NewResourceList([]*workspacesettings.Resource{r2}, rid2.Ref(), lo.ToPtr(true))
	ws := workspacesettings.New().NewID().Tiles(tiles).Terrains(terrains).MustBuild()

	wsd := &WorkspaceSettingsDocument{
		ID:       ws.ID().String(),
		Tiles:    ToResourceListDocument(ws.Tiles()),
		Terrains: ToResourceListDocument(ws.Terrains()),
	}

	res, err := wsd.Model()
	assert.NoError(t, err)
	assert.Equal(t, ws, res)
	
	wsd2 := &WorkspaceSettingsDocument{
		ID:       "",
		Tiles:    ToResourceListDocument(nil),
		Terrains: ToResourceListDocument(nil),
	}
	res2, err2 := wsd2.Model()
	assert.ErrorIs(t, err2, workspacesettings.ErrInvalidID)
	assert.Nil(t, res2)
	
	wsid := workspacesettings.NewID()
	wsd3 := &WorkspaceSettingsDocument{
		ID:       wsid.String(),
		Tiles:    ToResourceListDocument(nil),
		Terrains: ToResourceListDocument(nil),
	}
	res3, err3 := wsd3.Model()
	assert.NoError(t, err3)
	assert.Nil(t, res3.Tiles())
	assert.Nil(t, res3.Terrains())
}