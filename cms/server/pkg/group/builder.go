package group

import (
	"fmt"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearthx/rerror"
)

type Builder struct {
	group *Group
}

func New() *Builder {
	return &Builder{group: &Group{}}
}

func (b *Builder) Build() (*Group, error) {
	if b.group.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.group.schema.IsNil() {
		return nil, ErrInvalidID
	}
	if !validateGroupKey(b.group.key) {
		return nil, &rerror.Error{
			Label: id.ErrInvalidKey,
			Err:   fmt.Errorf("%s", b.group.key.String()),
		}
	}
	return b.group, nil
}

func (b *Builder) MustBuild() *Group {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id ID) *Builder {
	b.group.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.group.id = NewID()
	return b
}

func (b *Builder) Project(p id.ProjectID) *Builder {
	b.group.project = p
	return b
}

func (b *Builder) Schema(s id.SchemaID) *Builder {
	b.group.schema = s
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.group.name = name
	return b
}

func (b *Builder) Description(description string) *Builder {
	b.group.description = description
	return b
}

func (b *Builder) Key(key key.Key) *Builder {
	b.group.key = key
	return b
}
