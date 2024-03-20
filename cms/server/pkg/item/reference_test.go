package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func Test_AreItemsReferenced(t *testing.T) {
	prj := project.New().NewID().MustBuild()
	mid1, mid2, mid3 := id.NewModelID(), id.NewModelID(), id.NewModelID()
	fid1, fid2, fid3 := id.NewFieldID(), id.NewFieldID(), id.NewFieldID()
	sid1, sid2, sid3 := id.NewSchemaID(), id.NewSchemaID(), id.NewSchemaID()
	cf1 := &schema.CorrespondingField{
		Title:       "title",
		Key:         "key",
		Description: "description",
		Required:    true,
	}
	cf2 := &schema.CorrespondingField{
		Title:       "title",
		Key:         "key",
		Description: "description",
		Required:    true,
	}
	f1 := schema.NewField(schema.NewReference(mid2, sid1, fid2.Ref(), cf1).TypeProperty()).ID(fid1).Key(key.Random()).MustBuild()
	f2 := schema.NewField(schema.NewReference(mid1, sid2, fid1.Ref(), cf2).TypeProperty()).ID(fid2).Key(key.Random()).MustBuild()
	f3 := schema.NewField(schema.NewReference(mid3, sid3, nil, nil).TypeProperty()).ID(fid3).Key(key.Random()).MustBuild()
	s1 := schema.New().ID(sid1).Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{f1}).MustBuild()
	s2 := schema.New().ID(sid2).Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{f2}).MustBuild()
	s3 := schema.New().ID(sid3).Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(schema.FieldList{f3}).MustBuild()
	iid1, iid2, iid3 := id.NewItemID(), id.NewItemID(), id.NewItemID()
	if1 := NewField(fid1, value.TypeReference.Value(iid2.String()).AsMultiple(), nil)
	if2 := NewField(fid2, value.TypeReference.Value(iid1.String()).AsMultiple(), nil)
	if3 := NewField(fid3, value.TypeReference.Value(id.NewItemID().String()).AsMultiple(), nil)
	i1 := New().ID(iid1).Schema(sid1).Model(mid1).Project(prj.ID()).Fields([]*Field{if1}).Thread(id.NewThreadID()).MustBuild()
	i2 := New().ID(iid2).Schema(sid2).Model(mid2).Project(prj.ID()).Fields([]*Field{if2}).Thread(id.NewThreadID()).MustBuild()
	i3 := New().ID(iid3).Schema(sid3).Model(mid3).Project(prj.ID()).Fields([]*Field{if3}).Thread(id.NewThreadID()).MustBuild()

	ff1, ff2 := AreItemsReferenced(i1, i2, s1, s2)
	assert.Equal(t, fid1, *ff1)
	assert.Equal(t, fid2, *ff2)

	ff1, ff3 := AreItemsReferenced(i1, i3, s1, s3)
	assert.Nil(t, ff1)
	assert.Nil(t, ff3)

	ff4, ff5 := AreItemsReferenced(nil, nil, nil, nil)
	assert.Nil(t, ff4)
	assert.Nil(t, ff5)
}
