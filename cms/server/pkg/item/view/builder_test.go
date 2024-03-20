package view

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestBuilder_ID(t *testing.T) {
	iid := NewID()
	b := New().ID(iid)
	assert.Equal(t, iid, b.v.id)
}

func TestBuilder_SchemaID(t *testing.T) {
	sid := schema.NewID()
	b := New().Schema(sid)
	assert.Equal(t, sid, b.v.Schema())
}

func TestNew(t *testing.T) {
	res := New()
	assert.NotNil(t, res)
}

func TestBuilder_NewID(t *testing.T) {
	b := New().NewID()
	assert.NotNil(t, b.v.id)
	assert.False(t, b.v.id.IsEmpty())
}

func TestBuilder_Project(t *testing.T) {
	pid := project.NewID()
	b := New().Project(pid)
	assert.Equal(t, pid, b.v.project)
}

func TestBuilder_Model(t *testing.T) {
	mid := id.NewModelID()
	b := New().Model(mid)
	assert.Equal(t, mid, b.v.model)
}

func TestBuilder_Name(t *testing.T) {
	b := New().Name("test")
	assert.Equal(t, "test", b.v.name)
}

func TestBuilder_Sort(t *testing.T) {
	s := &Sort{}
	b := New().Sort(s)
	assert.Equal(t, s, b.v.sort)
}

func TestBuilder_Filter(t *testing.T) {
	c := &Condition{}
	b := New().Filter(c)
	assert.Equal(t, c, b.v.filter)
}

func TestBuilder_Columns(t *testing.T) {
	c := &ColumnList{}
	b := New().Columns(c)
	assert.Equal(t, c, b.v.columns)
}

func TestBuilder_User(t *testing.T) {
	uId := accountdomain.NewUserID()
	b := New().User(uId)
	assert.Equal(t, uId, b.v.user)
}

func TestBuilder_Timestamp(t *testing.T) {
	tt := time.Now()
	b := New().UpdatedAt(tt)
	assert.Equal(t, tt, b.v.updatedAt)
}

func TestBuilder_Build(t *testing.T) {
	b := New()
	assert.NotNil(t, b)
	v := b.MustBuild()
	assert.NotNil(t, v)
}

func TestBuilder_MustBuild(t *testing.T) {
	b := New()
	assert.NotNil(t, b)
	v := b.MustBuild()
	assert.NotNil(t, v)
}
