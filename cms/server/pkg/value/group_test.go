package value

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
	"testing"
)

func Test_propertyGroup_ToValue(t *testing.T) {
	a := id.NewItemGroupID()

	tests := []struct {
		name  string
		args  []any
		want1 any
		want2 bool
	}{
		{
			name:  "string",
			args:  []any{a.String(), a.StringRef()},
			want1: a,
			want2: true,
		},
		{
			name:  "id",
			args:  []any{a, &a},
			want1: a,
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
			p := &propertyGroup{}
			for i, v := range tt.args {
				got1, got2 := p.ToValue(v)
				assert.Equal(t, tt.want1, got1, "test %d", i)
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
		})
	}
}

func Test_propertyGroup_ToInterface(t *testing.T) {
	a := id.NewItemGroupID()
	tt, ok := (&propertyGroup{}).ToInterface(a)
	assert.Equal(t, a.String(), tt)
	assert.Equal(t, true, ok)
}

func Test_propertyGroup_IsEmpty(t *testing.T) {
	assert.True(t, (&propertyGroup{}).IsEmpty(id.ItemGroupID{}))
	assert.False(t, (&propertyGroup{}).IsEmpty(id.NewItemGroupID()))
}

func Test_propertyGroup_Validate(t *testing.T) {
	a := id.NewItemGroupID()
	assert.True(t, (&propertyGroup{}).Validate(a))
}

func Test_propertyGroup_Equal(t *testing.T) {
	pr := &propertyGroup{}
	iid1 := id.NewItemGroupID()
	iid2, _ := id.ItemGroupIDFrom(iid1.String())
	assert.True(t, pr.Equal(iid1, iid2))
}

func TestValue_ValueGroup(t *testing.T) {
	var v *Value
	var iid id.ItemGroupID
	got, ok := v.ValueGroup()
	assert.Equal(t, iid, got)
	assert.Equal(t, false, ok)

	iid = id.NewItemGroupID()
	v = &Value{
		v: iid,
	}
	got, ok = v.ValueGroup()
	assert.Equal(t, iid, got)
	assert.Equal(t, true, ok)
}

func TestMultiple_ValuesGroup(t *testing.T) {
	var m *Multiple
	got, ok := m.ValuesGroup()
	var expected []Group
	assert.Equal(t, expected, got)
	assert.Equal(t, false, ok)

	iid1 := id.NewItemGroupID()
	iid2 := id.NewItemGroupID()
	iid3 := id.NewItemGroupID()
	m = NewMultiple(TypeGroup, []any{iid1, iid2, iid3})
	expected = []Group{iid1, iid2, iid3}
	got, _ = m.ValuesGroup()
	assert.Equal(t, expected, got)
}
