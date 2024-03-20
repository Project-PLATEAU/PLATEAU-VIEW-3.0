package preparegspatialjp

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRenameCityGMLZip(t *testing.T) {
	tests := []struct {
		ty            string
		prefix        string
		path          string
		base          string
		expected      string
		expectedError bool
	}{
		{
			ty:       "bldg",
			path:     "bldg/file.txt",
			expected: "bldg/file.txt",
		},
		{
			ty:       "bldg",
			path:     "udx/bldg/file.txt",
			expected: "bldg/file.txt",
		},
		{
			ty:       "bldg",
			prefix:   "udx/",
			path:     "udx/bldg/file.txt",
			expected: "bldg/file.txt",
		},
		{
			ty:       "bldg",
			prefix:   "udx/",
			path:     "udx/bldg/bldg/file.txt",
			base:     "udx",
			expected: "udx/bldg/file.txt",
		},
		{
			ty:       "bldg",
			prefix:   "udx/",
			path:     "udx/xxx_bldg/file.txt",
			expected: "bldg/file.txt",
		},
		{
			ty:       "bldg",
			path:     "xxx_bldg/file.txt",
			expected: "bldg/file.txt",
		},
		{
			ty:       "bldg",
			path:     "xxx_bldg/bldg/file.txt",
			expected: "bldg/file.txt",
		},
		{
			ty:            "bldg",
			path:          "file.gml",
			expectedError: true,
		},
	}

	for _, test := range tests {
		test := test
		t.Run(test.path, func(t *testing.T) {
			p, err := cityGMLZipPath(test.ty, test.prefix, test.base)(test.path)
			assert.Equal(t, test.expected, p)
			if !test.expectedError {
				assert.NoError(t, err)
			} else {
				assert.Error(t, err)
			}
		})
	}
}
