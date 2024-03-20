package value

import (
	"encoding/json"
	"math"
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_propertyNumber_ToValue(t *testing.T) {
	now := time.Now()
	tests := []struct {
		name  string
		args  []any
		want1 any
		want2 bool
	}{
		{
			name: "zero",
			args: []any{
				0, 0.0, "0", json.Number("0"), json.Number("-0"),
				lo.ToPtr(0), lo.ToPtr(0.0), lo.ToPtr("0"), lo.ToPtr(json.Number("0")), lo.ToPtr(json.Number("-0")),
			},
			want1: 0.0,
			want2: true,
		},
		{
			name: "int",
			args: []any{
				int8(5), int32(5), int16(5), int64(5), "5", json.Number("5"), lo.ToPtr(int8(5)),
				lo.ToPtr(int8(5)), lo.ToPtr(int32(5)), lo.ToPtr(int16(5)), lo.ToPtr(int64(5)), lo.ToPtr("5"),
				uint8(5), uint(5), uint32(5), uint16(5), uint64(5), lo.ToPtr(uint8(5)), uintptr(5), lo.ToPtr(uint32(5)), lo.ToPtr(uint16(5)), lo.ToPtr(uint64(5)), lo.ToPtr(uint(5)), lo.ToPtr(uintptr(5)),
			},
			want1: 5.0,
			want2: true,
		},
		{
			name: "bool false",
			args: []any{
				false, lo.ToPtr(false),
			},
			want1: 0.0,
			want2: true,
		},
		{
			name: "bool true",
			args: []any{
				true, lo.ToPtr(true),
			},
			want1: 1.0,
			want2: true,
		},
		{
			name:  "positive",
			args:  []any{1.12, "1.12", json.Number("1.12"), lo.ToPtr(1.12), lo.ToPtr("1.12"), lo.ToPtr(json.Number("1.12"))},
			want1: 1.12,
			want2: true,
		},
		{
			name:  "negative",
			args:  []any{-0.11, "-0.11", json.Number("-0.11"), lo.ToPtr(-0.11), lo.ToPtr("-0.11"), lo.ToPtr(json.Number("-0.11"))},
			want1: -0.11,
			want2: true,
		},
		{
			name:  "nan",
			args:  []any{math.NaN()},
			want1: math.NaN(),
			want2: true,
		},
		{
			name:  "inf",
			args:  []any{math.Inf(0), json.Number("Infinity")},
			want1: math.Inf(0),
			want2: true,
		},
		{
			name:  "negative inf",
			args:  []any{math.Inf(-1), json.Number("-Infinity")},
			want1: math.Inf(-1),
			want2: true,
		},
		{
			name:  "time",
			args:  []any{now, lo.ToPtr(now)},
			want1: float64(now.Unix()),
			want2: true,
		},
		{
			name:  "nil",
			args:  []any{"foo", (*float64)(nil), (*string)(nil), (*int)(nil), (*json.Number)(nil), nil},
			want1: nil,
			want2: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			p := &propertyNumber{}
			for i, v := range tt.args {
				got1, got2 := p.ToValue(v)
				if f, ok := tt.want1.(Number); ok {
					if math.IsNaN(f) {
						assert.True(t, math.IsNaN(tt.want1.(Number)))
					} else {
						assert.Equal(t, tt.want1, got1, "test %d", i)
					}
				} else {
					assert.Equal(t, tt.want1, got1, "test %d", i)
				}
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
		})
	}
}

func Test_propertyNumber_ToInterface(t *testing.T) {
	v := float64(1)
	tt, ok := (&propertyNumber{}).ToInterface(v)
	assert.Equal(t, v, tt)
	assert.Equal(t, true, ok)
}

func Test_propertyNumber_IsEmpty(t *testing.T) {
	assert.False(t, (&propertyNumber{}).IsEmpty(0))
}

func Test_propertyNumber_Validate(t *testing.T) {
	assert.True(t, (&propertyNumber{}).Validate(float64(1)))
	assert.False(t, (&propertyNumber{}).Validate("a"))
}

func TestValue_ValueNumber(t *testing.T) {
	var v *Value
	got, ok := v.ValueNumber()
	assert.Equal(t, 0.0, got)
	assert.Equal(t, false, ok)

	v = &Value{
		v: 5.0,
	}
	got, ok = v.ValueNumber()
	assert.Equal(t, 5.0, got)
	assert.Equal(t, true, ok)
	v = &Value{
		v: "a",
	}
	got, ok = v.ValueNumber()
	assert.Equal(t, 0.0, got)
	assert.Equal(t, false, ok)
}

func TestMultiple_ValuesNumber(t *testing.T) {
	var m *Multiple
	got, ok := m.ValuesNumber()
	var expected []Number
	assert.Equal(t, expected, got)
	assert.Equal(t, false, ok)
	m = NewMultiple(TypeNumber, []any{5.0, 6.0, 7.0})
	expected = []Number{5.0, 6.0, 7.0}
	got, _ = m.ValuesNumber()
	assert.Equal(t, expected, got)
}

func Test_propertyNumber_Equal(t *testing.T) {
	var f1, f2 float64 = 10, 0
	assert.True(t, (&propertyNumber{}).Equal(f1, f1))
	assert.True(t, (&propertyNumber{}).Equal(nil, nil))
	assert.True(t, (&propertyNumber{}).Equal(f2, nil))
	assert.False(t, (&propertyNumber{}).Equal(nil, f1))
	assert.False(t, (&propertyNumber{}).Equal(f1, f2))
}
