package workspacesettings

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_NewURLResourceProps(t *testing.T) {
	pp := NewURLResourceProps("foo", "bar", "baz")
	assert.Equal(t, pp.Name(), "foo")
	assert.Equal(t, pp.URL(), "bar")
	assert.Equal(t, pp.Image(), "baz")
}
