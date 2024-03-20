package value

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func Test_propertyReference_ToValue(t *testing.T) {
	a := id.NewItemID()

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
			p := &propertyReference{}
			for i, v := range tt.args {
				got1, got2 := p.ToValue(v)
				assert.Equal(t, tt.want1, got1, "test %d", i)
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
		})
	}
}

func Test_propertyReference_ToInterface(t *testing.T) {
	a := id.NewItemID()
	tt, ok := (&propertyReference{}).ToInterface(a)
	assert.Equal(t, a.String(), tt)
	assert.Equal(t, true, ok)
}

func Test_propertyReference_IsEmpty(t *testing.T) {
	assert.True(t, (&propertyReference{}).IsEmpty(id.ItemID{}))
	assert.False(t, (&propertyReference{}).IsEmpty(id.NewItemID()))
}

func Test_propertyReference_Validate(t *testing.T) {
	a := id.NewItemID()
	assert.True(t, (&propertyReference{}).Validate(a))
}

func Test_propertyReference_Equal(t *testing.T) {
	pr := &propertyReference{}
	iid1 := id.NewItemID()
	iid2, _ := id.ItemIDFrom(iid1.String())
	assert.True(t, pr.Equal(iid1, iid2))
	assert.True(t, pr.Equal(nil, nil))
	assert.False(t, pr.Equal(nil, iid1))
	assert.False(t, pr.Equal(iid2, nil))
	assert.False(t, pr.Equal(iid2, id.NewItemID()))
	assert.False(t, pr.Equal(iid2, id.ItemID{}))
}

func TestValue_ValueReference(t *testing.T) {
	var v *Value
	var iid id.ItemID
	got, ok := v.ValueReference()
	assert.Equal(t, iid, got)
	assert.Equal(t, false, ok)

	iid = id.NewItemID()
	v = &Value{
		v: iid,
	}
	got, ok = v.ValueReference()
	assert.Equal(t, iid, got)
	assert.Equal(t, true, ok)
}

func TestMultiple_ValuesReference(t *testing.T) {
	var m *Multiple
	got, ok := m.ValuesReference()
	var expected []Reference
	assert.Equal(t, expected, got)
	assert.Equal(t, false, ok)

	iid1 := id.NewItemID()
	iid2 := id.NewItemID()
	iid3 := id.NewItemID()
	m = NewMultiple(TypeReference, []any{iid1, iid2, iid3})
	expected = []Reference{iid1, iid2, iid3}
	got, _ = m.ValuesReference()
	assert.Equal(t, expected, got)
}
