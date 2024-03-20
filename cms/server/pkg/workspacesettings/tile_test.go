package workspacesettings

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_NewTileResource(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	assert.Equal(t, tt.ID(), rid)
	assert.Equal(t, tt.Type(), TileTypeDefault)
	assert.Equal(t, tt.Props(), pp)
}