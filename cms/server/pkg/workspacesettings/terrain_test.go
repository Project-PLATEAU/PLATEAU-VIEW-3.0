package workspacesettings

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_NewTerrainResource(t *testing.T) {
	rid := NewResourceID()
	pp := NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt := NewTerrainResource(rid, TerrainTypeCesiumIon, pp)
	assert.Equal(t, tt.ID(), rid)
	assert.Equal(t, tt.Type(), TerrainTypeCesiumIon)
	assert.Equal(t, tt.Props(), pp)
}