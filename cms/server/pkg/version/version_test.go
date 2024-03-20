package version

import (
	"testing"

	"github.com/chrispappas/golang-generics-set/set"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestVersion_OrRef(t *testing.T) {
	v := New()
	assert.Equal(t, VersionOrRef{version: v}, v.OrRef())
	assert.Equal(t, VersionOrRef{}, Zero.OrRef())
}

func TestVersion_String(t *testing.T) {
	id := uuid.New()
	v := Version(id)
	assert.Equal(t, id.String(), v.String())
}

func TestVersion_IsZero(t *testing.T) {
	assert.True(t, Version(uuid.UUID{}).IsZero())
	assert.False(t, New().IsZero())
}

func TestVersion_Ref(t *testing.T) {
	v := New()
	assert.Equal(t, &v, v.Ref())
}

func TestNewVersions(t *testing.T) {
	v1, v2 := New(), New()
	assert.Equal(t, set.FromSlice([]Version{v1, v2}), NewVersions(v1, v2))
}
