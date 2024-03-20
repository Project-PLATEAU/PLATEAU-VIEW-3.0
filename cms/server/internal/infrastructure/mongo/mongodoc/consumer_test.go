package mongodoc

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

type testModel string

func (m testModel) Model() (string, error) {
	return "", nil
}

func TestNewConsumer(t *testing.T) {
	c := NewConsumer[testModel, string]()
	assert.NotNil(t, c)
}
