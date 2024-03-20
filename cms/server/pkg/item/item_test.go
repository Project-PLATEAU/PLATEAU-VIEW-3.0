package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestItem_UpdateFields(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()
	f := NewField(id.NewFieldID(), value.TypeText.Value("test").AsMultiple(), nil)
	fid, fid2, fid3 := id.NewFieldID(), id.NewFieldID(), id.NewFieldID()

	tests := []struct {
		name   string
		target *Item
		input  []*Field
		want   *Item
	}{
		{
			name:   "should update fields",
			input:  []*Field{f},
			target: &Item{},
			want: &Item{
				fields:    []*Field{f},
				timestamp: now,
			},
		},
		{
			name: "should update fields",
			input: []*Field{
				NewField(fid, value.TypeText.Value("test2").AsMultiple(), nil),
				NewField(fid3, value.TypeText.Value("test!!").AsMultiple(), nil),
			},
			target: &Item{
				fields: []*Field{
					NewField(fid, value.TypeText.Value("test").AsMultiple(), nil),
					NewField(fid2, value.TypeText.Value("test!").AsMultiple(), nil),
				},
			},
			want: &Item{
				fields: []*Field{
					NewField(fid, value.TypeText.Value("test2").AsMultiple(), nil),
					NewField(fid2, value.TypeText.Value("test!").AsMultiple(), nil),
					NewField(fid3, value.TypeText.Value("test!!").AsMultiple(), nil),
				},
				timestamp: now,
			},
		},
		{
			name:   "nil fields",
			input:  nil,
			target: &Item{},
			want:   &Item{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.target.UpdateFields(tt.input)
			assert.Equal(t, tt.want, tt.target)
		})
	}
}

func TestItem_ClearField(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	fid1, fid2, fid3 := id.NewFieldID(), id.NewFieldID(), id.NewFieldID()
	f1 := NewField(fid1, value.TypeText.Value("test").AsMultiple(), nil)
	f2 := NewField(fid2, value.TypeText.Value("test").AsMultiple(), nil)
	f3 := NewField(fid3, value.TypeText.Value("test").AsMultiple(), nil)

	i := &Item{fields: []*Field{f1, f2, f3}}

	i.ClearField(fid2)
	assert.Equal(t, []*Field{f1, f3}, i.fields)
}

func TestItem_ClearReferenceFields(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	fid1, fid2, fid3 := id.NewFieldID(), id.NewFieldID(), id.NewFieldID()
	f1 := NewField(fid1, value.TypeText.Value("test").AsMultiple(), nil)
	f2 := NewField(fid2, value.TypeText.Value("test").AsMultiple(), nil)
	f3 := NewField(fid3, value.TypeReference.Value(id.NewItemID()).AsMultiple(), nil)

	i := &Item{fields: []*Field{f1, f2, f3}}

	i.ClearReferenceFields()
	assert.Equal(t, []*Field{f1, f2}, i.fields)
}

func TestItem_Filtered(t *testing.T) {
	sfid1 := id.NewFieldID()
	sfid2 := id.NewFieldID()
	sfid3 := id.NewFieldID()
	sfid4 := id.NewFieldID()
	f1 := &Field{field: sfid1}
	f2 := &Field{field: sfid2}
	f3 := &Field{field: sfid3}
	f4 := &Field{field: sfid4}

	tests := []struct {
		name string
		item *Item
		args id.FieldIDList
		want *Item
	}{
		{
			name: "success",
			item: &Item{
				fields: []*Field{f1, f2, f3, f4},
			},
			args: id.FieldIDList{sfid1, sfid3},
			want: &Item{
				fields: []*Field{f1, f3},
			},
		},
		{
			name: "nil item",
		},
		{
			name: "nil fs list",
			item: &Item{
				fields: []*Field{f1, f2, f3, f4},
			},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			got := tc.item.FilterFields(tc.args)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestItem_HasField(t *testing.T) {
	f1 := NewField(id.NewFieldID(), value.TypeText.Value("foo").AsMultiple(), nil)
	f2 := NewField(id.NewFieldID(), value.TypeText.Value("hoge").AsMultiple(), nil)
	i1 := New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Fields([]*Field{f1, f2}).Project(id.NewProjectID()).Thread(id.NewThreadID()).MustBuild()

	type args struct {
		fid   id.FieldID
		value any
	}
	tests := []struct {
		name string
		item *Item
		args args
		want bool
	}{
		{
			name: "true: must find a field",
			args: args{
				fid:   f1.FieldID(),
				value: f1.Value(),
			},
			item: i1,
			want: true,
		},
		{
			name: "false: no existed value",
			args: args{
				fid:   f1.FieldID(),
				value: "xxx",
			},
			item: i1,
			want: false,
		},
		{
			name: "false: no existed ID",
			args: args{
				fid:   id.NewFieldID(),
				value: f1.Value(),
			},
			item: i1,
			want: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			assert.Equal(t, tt.want, tt.item.HasField(tt.args.fid, tt.args.value))
		})
	}
}

func TestItem_AssetIDs(t *testing.T) {
	aid, aid2 := id.NewAssetID(), id.NewAssetID()
	assert.Equal(t, id.AssetIDList{aid, aid2}, (&Item{
		fields: []*Field{
			{value: value.New(value.TypeAsset, aid).AsMultiple()},
			{value: value.New(value.TypeText, "aa").AsMultiple()},
			{value: value.New(value.TypeAsset, aid2).AsMultiple()},
		},
	}).AssetIDs())
}

func TestItem_User(t *testing.T) {
	f1 := NewField(id.NewFieldID(), value.TypeText.Value("foo").AsMultiple(), nil)
	uid := accountdomain.NewUserID()
	i1 := New().NewID().User(uid).Schema(id.NewSchemaID()).Model(id.NewModelID()).Fields([]*Field{f1}).Project(id.NewProjectID()).Thread(id.NewThreadID()).MustBuild()

	assert.Equal(t, &uid, i1.User())
}

func TestItem_Integration(t *testing.T) {
	f1 := NewField(id.NewFieldID(), value.TypeText.Value("foo").AsMultiple(), nil)
	iid := id.NewIntegrationID()
	i1 := New().NewID().Integration(iid).Schema(id.NewSchemaID()).Model(id.NewModelID()).Fields([]*Field{f1}).Project(id.NewProjectID()).Thread(id.NewThreadID()).MustBuild()

	assert.Equal(t, &iid, i1.Integration())
}

func TestItem_SetUpdatedByIntegration(t *testing.T) {
	uid := accountdomain.NewUserID()
	iid := id.NewIntegrationID()
	itm := &Item{
		updatedByUser: uid.Ref(),
	}
	itm.SetUpdatedByIntegration(iid)
	assert.Equal(t, iid.Ref(), itm.UpdatedByIntegration())
	assert.Nil(t, itm.UpdatedByUser())
}

func TestItem_SetUpdatedByUser(t *testing.T) {
	uid := accountdomain.NewUserID()
	iid := id.NewIntegrationID()
	itm := &Item{
		updatedByIntegration: iid.Ref(),
	}
	itm.SetUpdatedByUser(uid)
	assert.Equal(t, uid.Ref(), itm.UpdatedByUser())
	assert.Nil(t, itm.UpdatedByIntegration())
}

func TestItem_SetMetadataItem(t *testing.T) {
	mid := NewID()
	itm := &Item{}
	itm.SetMetadataItem(mid)
	assert.Equal(t, mid.Ref(), itm.MetadataItem())
}

func TestItem_SetOriginalItem(t *testing.T) {
	oid := NewID()
	itm := &Item{}
	itm.SetOriginalItem(oid)
	assert.Equal(t, oid.Ref(), itm.OriginalItem())
}

func TestItem_GetTitle(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	sf2 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s1 := schema.New().NewID().Workspace(wid).Project(pid).Fields(schema.FieldList{sf1, sf2}).MustBuild()
	if1 := NewField(sf1.ID(), value.TypeBool.Value(false).AsMultiple(), nil)
	if2 := NewField(sf2.ID(), value.TypeText.Value("test").AsMultiple(), nil)
	i1 := New().NewID().Schema(s1.ID()).Model(id.NewModelID()).Fields([]*Field{if1, if2}).Project(pid).Thread(id.NewThreadID()).MustBuild()
	// schema is nil
	title := i1.GetTitle(nil)
	assert.Nil(t, title)
	// schema is not nil but no title field
	title = i1.GetTitle(s1)
	assert.Nil(t, title)
	// invalid type
	err := s1.SetTitleField(sf1.ID().Ref())
	assert.NoError(t, err)
	title = i1.GetTitle(s1)
	assert.Nil(t, title)
	// test title
	err = s1.SetTitleField(sf2.ID().Ref())
	assert.NoError(t, err)
	title = i1.GetTitle(s1)
	assert.Equal(t, "test", *title)
}
