package plateauapi

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestID(t *testing.T) {
	t.Logf("id string: %s", NewID("aaa", "bbb").String())
	assert.NotEmpty(t, NewID("bbb", "aaa").String())
	assert.Equal(t, Type("aaa"), NewID("bbb", "aaa").Type())
	assert.Equal(t, "bbb", NewID("bbb", "aaa").ID())
}

func TestAreaCode(t *testing.T) {
	assert.Equal(t, "01234567", AreaCode("01234567").String())

	assert.Equal(t, "01", AreaCode("01").PrefectureCode())
	assert.Equal(t, 1, AreaCode("01").PrefectureCodeInt())
	assert.True(t, AreaCode("01").IsPrefectureCode())

	assert.Equal(t, "01", AreaCode("01234567").PrefectureCode())
	assert.Equal(t, 1, AreaCode("01234567").PrefectureCodeInt())
	assert.False(t, AreaCode("01234567").IsPrefectureCode())

	assert.Equal(t, "", AreaCode("0").PrefectureCode())
	assert.Equal(t, 0, AreaCode("0").PrefectureCodeInt())
	assert.False(t, AreaCode("0").IsPrefectureCode())
}

func TestSpecNumber(t *testing.T) {
	assert.Equal(t, "2.3", SpecNumber("2.3"))
	assert.Equal(t, "2", SpecNumber("第2版"))
	assert.Equal(t, "2.3", SpecNumber("第2.3版"))
	assert.Equal(t, "2.3", SpecNumber("ps_2.3"))
}
