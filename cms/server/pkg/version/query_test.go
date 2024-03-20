package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAll(t *testing.T) {
	assert.Equal(t, Query{all: true}, All())
}

func TestEq(t *testing.T) {
	v := New()
	assert.Equal(t, Query{eq: v.OrRef().Ref()}, Eq(v.OrRef()))
}

func TestQuery_Match(t *testing.T) {
	res := ""
	qm := QueryMatch{
		All: func() {
			res = "all"
		},
		Eq: func(ref VersionOrRef) {
			res = "eq"
		},
	}
	q := All()
	q.Match(qm)
	assert.Equal(t, "all", res)

	q = Eq(New().OrRef())
	q.Match(qm)
	assert.Equal(t, "eq", res)
}
