package schema

import (
	"errors"
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

var ErrDuplicatedTag = errors.New("duplicated tag")

type TagList []*Tag
type Tag struct {
	id    TagID
	name  string
	color TagColor
}

type FieldTag struct {
	tags TagList
}

func NewFieldTag(tags TagList) (*FieldTag, error) {
	if tags.HasDuplication() {
		return nil, ErrDuplicatedTag
	}
	return &FieldTag{
		tags: tags,
	}, nil
}

func (f *FieldTag) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:   f.Type(),
		tag: f,
	}
}

func (f *FieldTag) Tags() TagList {
	return slices.Clone(f.tags)
}

func (*FieldTag) Type() value.Type {
	return value.TypeTag
}

func (f *FieldTag) Clone() *FieldTag {
	if f == nil {
		return nil
	}
	return &FieldTag{
		tags: f.Tags(),
	}
}

func (f *FieldTag) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Tag: func(a value.String) {
			tid, err2 := id.TagIDFrom(a)
			if err2 != nil {
				err = ErrInvalidValue
			}
			if !f.tags.HasTag(tid) {
				err = ErrInvalidValue
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}
func (f *FieldTag) ValidateMultiple(v *value.Multiple) (err error) {
	vs, ok := v.ValuesString()
	if !ok {
		return ErrInvalidValue
	}
	tmap := make(map[string]struct{})
	for _, i := range vs {
		if _, ok := tmap[i]; ok {
			return ErrDuplicatedTag
		}
		tmap[i] = struct{}{}
	}
	return
}

func NewTag(name string, color TagColor) *Tag {
	return &Tag{
		id:    NewTagID(),
		name:  strings.TrimSpace(name),
		color: color,
	}
}

func NewTagWithID(tid TagID, name string, color TagColor) (*Tag, error) {
	if tid.IsNil() {
		return nil, id.ErrInvalidID
	}
	tag := NewTag(name, color)
	tag.id = tid
	return tag, nil
}

func (t *Tag) ID() TagID {
	return t.id
}

func (t *Tag) Name() string {
	return t.name
}

func (t *Tag) Color() TagColor {
	return t.color
}

func (tl TagList) HasTag(tid TagID) bool {
	return slices.ContainsFunc(tl, func(tag *Tag) bool {
		return tag.id == tid
	})
}

func (tl TagList) IDs() TagIDList {
	return lo.Map(tl, func(tag *Tag, _ int) TagID {
		return tag.ID()
	})
}

func (tl TagList) HasDuplication() bool {
	nmap := make(map[string]struct{})
	imap := make(map[TagID]struct{})
	for _, i := range tl {
		if _, ok := nmap[i.Name()]; ok {
			return true
		}
		if _, ok := imap[i.ID()]; ok {
			return true
		}
		nmap[i.Name()] = struct{}{}
		imap[i.ID()] = struct{}{}
	}

	return false
}

func (tl TagList) FindByName(name string) *Tag {
	if name == "" {
		return nil
	}
	for _, i := range tl {
		if i.Name() == name {
			return i
		}
	}
	return nil
}

func (tl TagList) FindByID(tid TagID) *Tag {
	for _, i := range tl {
		if i.ID() == tid {
			return i
		}
	}
	return nil
}
