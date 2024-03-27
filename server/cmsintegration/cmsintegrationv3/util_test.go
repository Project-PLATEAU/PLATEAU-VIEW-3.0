package cmsintegrationv3

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetBracketContent(t *testing.T) {
	assert.Equal(t, "", getLastBracketContent("トンネルモデル"))
	assert.Equal(t, "tran", getLastBracketContent("交通（道路）モデル（tran）"))
}
