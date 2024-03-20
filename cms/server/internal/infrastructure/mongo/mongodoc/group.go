package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearthx/mongox"
)

type GroupDocument struct {
	ID          string
	Name        string
	Description string
	Key         string
	Project     string
	Schema      string
}

func NewGroup(group *group.Group) (*GroupDocument, string) {
	mId := group.ID().String()
	return &GroupDocument{
		ID:          mId,
		Name:        group.Name(),
		Description: group.Description(),
		Key:         group.Key().String(),
		Project:     group.Project().String(),
		Schema:      group.Schema().String(),
	}, mId
}

func (d *GroupDocument) Model() (*group.Group, error) {
	mId, err := id.GroupIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	pId, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}
	sId, err := id.SchemaIDFrom(d.Schema)
	if err != nil {
		return nil, err
	}

	return group.New().
		ID(mId).
		Name(d.Name).
		Description(d.Description).
		Key(key.New(d.Key)).
		Project(pId).
		Schema(sId).
		Build()
}

type GroupConsumer = mongox.SliceFuncConsumer[*GroupDocument, *group.Group]

func NewGroupConsumer() *GroupConsumer {
	return NewConsumer[*GroupDocument, *group.Group]()
}
