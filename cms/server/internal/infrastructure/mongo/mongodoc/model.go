package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/model"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearthx/mongox"
)

type ModelDocument struct {
	ID          string
	Name        string
	Description string
	Key         string
	Public      bool
	Project     string
	Schema      string
	Metadata    *string
	UpdatedAt   time.Time
	Order       int
}

func NewModel(model *model.Model) (*ModelDocument, string) {
	mId := model.ID().String()
	return &ModelDocument{
		ID:          mId,
		Name:        model.Name(),
		Description: model.Description(),
		Key:         model.Key().String(),
		Public:      model.Public(),
		Metadata:    model.Metadata().StringRef(),
		Project:     model.Project().String(),
		Schema:      model.Schema().String(),
		UpdatedAt:   model.UpdatedAt(),
		Order:       model.Order(),
	}, mId
}

func NewModels(models model.List) ([]*ModelDocument, []string) {
	res := make([]*ModelDocument, 0, len(models))
	ids := make([]string, 0, len(models))
	for _, d := range models {
		if d == nil {
			continue
		}
		r, rid := NewModel(d)
		res = append(res, r)
		ids = append(ids, rid)
	}
	return res, ids
}

func (d *ModelDocument) Model() (*model.Model, error) {
	mId, err := id.ModelIDFrom(d.ID)
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

	return model.New().
		ID(mId).
		Name(d.Name).
		Description(d.Description).
		UpdatedAt(d.UpdatedAt).
		Key(key.New(d.Key)).
		Public(d.Public).
		Project(pId).
		Metadata(id.SchemaIDFromRef(d.Metadata)).
		Schema(sId).
		Order(d.Order).
		Build()
}

type ModelConsumer = mongox.SliceFuncConsumer[*ModelDocument, *model.Model]

func NewModelConsumer() *ModelConsumer {
	return NewConsumer[*ModelDocument, *model.Model]()
}
