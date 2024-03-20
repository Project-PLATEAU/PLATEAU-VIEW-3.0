package workspacesettings

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_NewCesiumResourceProps(t *testing.T) {
	pp := NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	assert.Equal(t, pp.Name(), "foo")
	assert.Equal(t, pp.URL(), "bar")
	assert.Equal(t, pp.Image(), "baz")
	assert.Equal(t, pp.CesiumIonAssetID(), "test")
	assert.Equal(t, pp.CesiumIonAccessToken(), "test")
}