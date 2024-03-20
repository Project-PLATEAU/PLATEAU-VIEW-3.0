package cmsintegrationcommon

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPRCS_Code(t *testing.T) {
	assert.Equal(t, "6669", PRCS("第1系").EPSGCode())
	assert.Equal(t, "6670", PRCS("第2系").EPSGCode())
	assert.Equal(t, "6686", PRCS("第18系").EPSGCode())
	assert.Equal(t, "6687", PRCS("第19系").EPSGCode())
}
