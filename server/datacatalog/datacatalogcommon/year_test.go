package datacatalogcommon

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestYearInt(t *testing.T) {
	tests := []struct {
		input    string
		expected int
	}{
		{input: "2022年", expected: 2022},
		{input: "2022年度", expected: 2022},
		{input: "令和4年", expected: 2022},
		{input: "令和4年度", expected: 2022},
		{input: "invalid", expected: 0},
	}

	for _, test := range tests {
		actual := YearInt(test.input)
		assert.Equal(t, test.expected, actual, "Input: %s", test.input)
	}
}
