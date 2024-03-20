package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/stretchr/testify/assert"
)

func TestList_Filtered(t *testing.T) {
	sfid1 := id.NewFieldID()
	sfid2 := id.NewFieldID()
	sfid3 := id.NewFieldID()
	sfid4 := id.NewFieldID()
	f1 := &Field{field: sfid1}
	f2 := &Field{field: sfid2}
	f3 := &Field{field: sfid3}
	f4 := &Field{field: sfid4}
	i1 := &Item{
		fields: []*Field{f1, f3},
	}
	i2 := &Item{
		fields: []*Field{f2, f4},
	}
	il := List{i1, i2}
	sfl := id.FieldIDList{sfid1, sfid4}
	want := List{&Item{fields: []*Field{f1}}, &Item{fields: []*Field{f4}}}

	got := il.FilterFields(sfl)
	assert.Equal(t, want, got)
}

func TestList_Item(t *testing.T) {
	sfid1 := id.NewFieldID()
	sfid2 := id.NewFieldID()
	sfid3 := id.NewFieldID()
	sfid4 := id.NewFieldID()
	f1 := &Field{field: sfid1}
	f2 := &Field{field: sfid2}
	f3 := &Field{field: sfid3}
	f4 := &Field{field: sfid4}

	i1Id := id.NewItemID()
	i1 := &Item{
		id:     i1Id,
		fields: []*Field{f1, f3},
	}

	i2Id := id.NewItemID()
	i2 := &Item{
		id:     i2Id,
		fields: []*Field{f2, f4},
	}
	il := List{i1, i2}

	got, ok := il.Item(i1Id)
	assert.True(t, ok)
	assert.Equal(t, i1, got)

	got, ok = il.Item(id.NewItemID())
	assert.False(t, ok)
	assert.Nil(t, got)
}

func TestList_ItemsByField(t *testing.T) {
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	mid := id.NewModelID()
	f1 := NewField(id.NewFieldID(), value.TypeText.Value("foo").AsMultiple(), nil)
	f2 := NewField(id.NewFieldID(), value.TypeText.Value("hoge").AsMultiple(), nil)
	f3 := NewField(id.NewFieldID(), value.TypeBool.Value(true).AsMultiple(), nil)
	i1 := New().NewID().Schema(sid).Model(mid).Fields([]*Field{f1, f2}).Project(pid).Thread(id.NewThreadID()).MustBuild()
	i2 := New().NewID().Schema(sid).Model(mid).Fields([]*Field{f2, f3}).Project(pid).Thread(id.NewThreadID()).MustBuild()
	i3 := New().NewID().Schema(sid).Model(mid).Fields([]*Field{f1}).Project(pid).Thread(id.NewThreadID()).MustBuild()
	type args struct {
		fid   id.FieldID
		value any
	}
	tests := []struct {
		name      string
		l         List
		args      args
		wantCount int
	}{
		{
			name: "must find 2",
			l:    List{i1, i2, i3},
			args: args{
				fid:   f1.FieldID(),
				value: f1.Value(),
			},
			wantCount: 2,
		},
		{
			name: "must find 1",
			l:    List{i1, i2, i3},
			args: args{
				fid:   f3.FieldID(),
				value: f3.Value(),
			},
			wantCount: 1,
		},
		{
			name: "must find 0",
			l:    List{i1, i2, i3},
			args: args{
				fid:   id.NewFieldID(),
				value: "xxx",
			},
			wantCount: 0,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.wantCount, len(tt.l.ItemsByField(tt.args.fid, tt.args.value)))
		})
	}
}

func TestVersionedList_FilterFields(t *testing.T) {
	now := time.Now()
	fId := id.NewFieldID()
	i := New().NewID().
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Project(id.NewProjectID()).
		Thread(id.NewThreadID()).
		Fields([]*Field{NewField(fId, value.TypeBool.Value(true).AsMultiple(), nil)}).
		MustBuild()
	vl := VersionedList{
		version.MustBeValue(version.New(), nil, version.NewRefs(version.Latest), now, i),
	}

	assert.Equal(t, vl.FilterFields(id.FieldIDList{fId}), vl.FilterFields(id.FieldIDList{fId}))
}

func TestVersionedList_Item(t *testing.T) {
	now := time.Now()
	fId := id.NewFieldID()
	iId := id.NewItemID()
	i := New().ID(iId).
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Project(id.NewProjectID()).
		Thread(id.NewThreadID()).
		Fields([]*Field{NewField(fId, value.TypeBool.Value(true).AsMultiple(), nil)}).
		MustBuild()
	v := version.New()
	vl := VersionedList{
		version.MustBeValue(v, nil, version.NewRefs(version.Latest), now, i),
	}

	assert.Equal(t, version.MustBeValue(v, nil, version.NewRefs(version.Latest), now, i), vl.Item(iId))
}

func TestVersionedList_Unwrap(t *testing.T) {
	now := time.Now()
	fId := id.NewFieldID()
	iId := id.NewItemID()
	i := New().ID(iId).
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Project(id.NewProjectID()).
		Thread(id.NewThreadID()).
		Fields([]*Field{NewField(fId, value.TypeBool.Value(true).AsMultiple(), nil)}).
		MustBuild()
	v := version.New()
	vl := VersionedList{
		version.MustBeValue(v, nil, version.NewRefs(version.Latest), now, i),
	}

	assert.Equal(t, List{i}, vl.Unwrap())
}
