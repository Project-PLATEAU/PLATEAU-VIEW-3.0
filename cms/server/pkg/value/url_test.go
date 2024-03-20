package value

import (
	"net/url"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_propertyURL_ToValue(t *testing.T) {
	u, _ := url.Parse("https://example.com")

	tests := []struct {
		name  string
		args  []any
		want1 any
		want2 bool
	}{
		{
			name:  "string",
			args:  []any{"https://example.com", lo.ToPtr("https://example.com")},
			want1: u,
			want2: true,
		},
		{
			name:  "string empty",
			args:  []any{""},
			want1: nil,
			want2: true,
		},
		{
			name:  "url",
			args:  []any{u, *u},
			want1: u,
			want2: true,
		},
		{
			name:  "nil",
			args:  []any{(*string)(nil), nil},
			want1: nil,
			want2: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &propertyURL{}
			for i, v := range tt.args {
				got1, got2 := p.ToValue(v)
				assert.Equal(t, tt.want1, got1, "test %d", i)
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
		})
	}
}

func Test_propertyURL_ToInterface(t *testing.T) {
	v := lo.Must(url.Parse("https://example.com"))
	tt, ok := (&propertyURL{}).ToInterface(v)
	assert.Equal(t, v.String(), tt)
	assert.Equal(t, true, ok)
}

func Test_propertyURL_IsEmpty(t *testing.T) {
	assert.True(t, (&propertyURL{}).IsEmpty(&url.URL{}))
	assert.False(t, (&propertyURL{}).IsEmpty(&url.URL{Path: "a"}))
}

func Test_propertyURL_Validate(t *testing.T) {
	v := lo.Must(url.Parse("https://example.com"))
	assert.True(t, (&propertyURL{}).Validate(v))
}

func Test_propertyURL_Equal(t *testing.T) {
	pu := &propertyURL{}
	u1, _ := url.Parse("https://example.com")
	u2, _ := url.Parse("https://example.com")
	u3, _ := url.Parse("https://foo.com")
	assert.True(t, pu.Equal(u1, u2))
	assert.True(t, pu.Equal(nil, nil))
	assert.False(t, pu.Equal(nil, u1))
	assert.False(t, pu.Equal(u1, nil))
	assert.False(t, pu.Equal(u1, u3))
}

func TestMultiple_ValuesURL(t *testing.T) {
	var v *Value
	got, ok := v.ValueURL()
	var u *url.URL
	assert.Equal(t, u, got)
	assert.Equal(t, false, ok)

	v = &Value{
		v: 0,
	}
	got, ok = v.ValueURL()
	assert.Equal(t, u, got)
	assert.Equal(t, false, ok)

	u, _ = url.Parse("https://example.com")
	v = &Value{
		v: u,
	}
	got, ok = v.ValueURL()
	assert.Equal(t, u, got)
	assert.Equal(t, true, ok)
}

func TestValue_ValueURL(t *testing.T) {
	var m *Multiple
	got, ok := m.ValuesURL()
	var expected []URL
	assert.Equal(t, expected, got)
	assert.Equal(t, false, ok)

	u1, _ := url.Parse("https://example1.com")
	u2, _ := url.Parse("https://example2.com")
	u3, _ := url.Parse("https://example3.com")
	m = NewMultiple(TypeURL, []any{u1, u2, u3})
	expected = []URL{u1, u2, u3}
	got, _ = m.ValuesURL()
	assert.Equal(t, expected, got)
}
