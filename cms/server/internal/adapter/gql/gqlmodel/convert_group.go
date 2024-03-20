package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/group"
)

func ToGroup(g *group.Group) *Group {
	if g == nil {
		return nil
	}

	return &Group{
		ID:          IDFrom(g.ID()),
		ProjectID:   IDFrom(g.Project()),
		SchemaID:    IDFrom(g.Schema()),
		Name:        g.Name(),
		Description: g.Description(),
		Key:         g.Key().String(),
	}
}
