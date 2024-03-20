package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewTag(t *testing.T) {
	expected := &Tag{
		name:  "xyz",
		color: TagColorVolcano,
	}
	res := NewTag("xyz", TagColorVolcano)
	assert.Equal(t, expected.Name(), res.Name())
	assert.Equal(t, expected.Color(), res.Color())
	assert.False(t, res.ID().IsEmpty())
}

func TestNewTagWithID(t *testing.T) {
	tid := NewTagID()
	expected := &Tag{id: tid, name: "xxx", color: TagColorBlue}
	res, err := NewTagWithID(tid, "xxx", TagColorBlue)
	assert.NoError(t, err)
	assert.Equal(t, expected, res)
}

func TestFieldTag_Type(t *testing.T) {
	assert.Equal(t, value.TypeTag, (&FieldTag{}).Type())
}

func TestFieldTag_TypeProperty(t *testing.T) {
	f := FieldTag{}
	assert.Equal(t, &TypeProperty{
		t:   f.Type(),
		tag: &f,
	}, (&f).TypeProperty())
}
func TestFieldTag_Clone(t *testing.T) {
	assert.Nil(t, (*FieldTag)(nil).Clone())
	assert.Equal(t, &FieldTag{}, (&FieldTag{}).Clone())
}

func TestFieldTag_Validate(t *testing.T) {
	tag := NewTag("xyz", TagColorVolcano)
	assert.NoError(t, (&FieldTag{tags: TagList{tag}}).Validate(value.TypeTag.Value(tag.ID().String())))
	assert.Equal(t, ErrInvalidValue, (&FieldTag{tags: TagList{tag}}).Validate(value.TypeTag.Value("aaa")))
	assert.Equal(t, ErrInvalidValue, (&FieldTag{}).Validate(value.TypeText.Value("")))
}

func TestTagList_HasDuplication(t *testing.T) {
	tag1 := NewTag("xxx", TagColorOrange)
	tag2 := NewTag("yyy", TagColorOrange)
	tag3 := NewTag("xxx", TagColorOrange)
	tag4, _ := NewTagWithID(tag1.ID(), "zzz", TagColorOrange)
	assert.False(t, TagList{tag1, tag2}.HasDuplication())
	assert.True(t, TagList{tag1, tag2, tag3}.HasDuplication())
	assert.True(t, TagList{tag1, tag2, tag4}.HasDuplication())
}

func TestTagList_FindByName(t *testing.T) {
	tag1 := NewTag("xxx", TagColorOrange)
	tag2 := NewTag("yyy", TagColorOrange)
	tag3 := NewTag("zzz", TagColorOrange)
	tag4, _ := NewTagWithID(tag1.ID(), "ppp", TagColorOrange)

	assert.Equal(t, tag4, TagList{tag1, tag2, tag3, tag4}.FindByName("ppp"))
	assert.Nil(t, TagList{tag1, tag2, tag3, tag4}.FindByName("some value"))
}

func TestTagList_FindByID(t *testing.T) {
	tag1 := NewTag("xxx", TagColorOrange)
	tag2 := NewTag("yyy", TagColorOrange)
	tag3 := NewTag("zzz", TagColorOrange)

	assert.Equal(t, tag3, TagList{tag1, tag2, tag3}.FindByID(tag3.ID()))
	assert.Nil(t, TagList{tag1, tag2, tag3}.FindByID(id.NewTagID()))
}
