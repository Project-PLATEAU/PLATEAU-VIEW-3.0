package schema

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestTagColorFrom(t *testing.T) {

	tests := []struct {
		name string
		arg  string
		want TagColor
	}{
		{
			name: "blue",
			arg:  "blue",
			want: TagColorBlue,
		},
		{
			name: "red",
			arg:  "red",
			want: TagColorRed,
		},
		{
			name: "gold",
			arg:  "gold",
			want: TagColorGold,
		},
		{
			name: "green",
			arg:  "green",
			want: TagColorGreen,
		},
		{
			name: "geekblue",
			arg:  "geekblue",
			want: TagColorGeekblue,
		},
		{
			name: "magenta",
			arg:  "magenta",
			want: TagColorMagenta,
		},
		{
			name: "purple",
			arg:  "purple",
			want: TagColorPurple,
		},
		{
			name: "cyan",
			arg:  "cyan",
			want: TagColorCyan,
		},
		{
			name: "lime",
			arg:  "lime",
			want: TagColorLime,
		},
		{
			name: "orange",
			arg:  "orange",
			want: TagColorOrange,
		},
		{
			name: "volcano",
			arg:  "volcano",
			want: TagColorVolcano,
		},
		{
			name: "default",
			arg:  "foo",
			want: "",
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equalf(tt, tc.want, TagColorFrom(tc.arg), "TagColorFrom(%v)", tc.arg)
		})
	}
}
