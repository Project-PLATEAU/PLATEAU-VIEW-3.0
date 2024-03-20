package group

import (
	"fmt"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearthx/rerror"
)

type Group struct {
	id          ID
	schema      SchemaID
	project     ProjectID
	name        string
	description string
	key         key.Key
}

func (g *Group) ID() ID {
	return g.id
}

func (g *Group) Name() string {
	return g.name
}

func (g *Group) Schema() SchemaID {
	return g.schema
}

func (g *Group) Project() ProjectID {
	return g.project
}

func (g *Group) Description() string {
	return g.description
}

func (g *Group) Key() key.Key {
	return g.key
}

func (g *Group) Clone() *Group {
	if g == nil {
		return nil
	}
	return &Group{
		id:          g.id,
		schema:      g.schema,
		project:     g.project,
		name:        g.name,
		description: g.description,
		key:         g.key,
	}
}

func (g *Group) SetName(name string) {
	g.name = name
}

func (g *Group) SetDescription(des string) {
	g.description = des
}

func (g *Group) SetKey(key key.Key) error {
	if !validateGroupKey(key) {
		return &rerror.Error{
			Label: id.ErrInvalidKey,
			Err:   fmt.Errorf("%s", key.String()),
		}
	}
	g.key = key
	return nil
}

func validateGroupKey(key key.Key) bool {
	return key.IsValid() && len(key.String()) > 2
}
