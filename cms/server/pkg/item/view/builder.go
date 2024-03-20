package view

import (
	"time"

	"github.com/samber/lo"
)

type Buildr struct {
	v *View
}

func New() *Buildr {
	return &Buildr{
		v: &View{},
	}
}

func (b *Buildr) Build() (*View, error) {
	return b.v, nil
}

func (b *Buildr) MustBuild() *View {
	return lo.Must(b.Build())
}

func (b *Buildr) ID(id ID) *Buildr {
	b.v.id = id
	return b
}

func (b *Buildr) NewID() *Buildr {
	b.v.id = NewID()
	return b
}

func (b *Buildr) Name(name string) *Buildr {
	b.v.name = name
	return b
}

func (b *Buildr) Schema(schema SchemaID) *Buildr {
	b.v.schema = schema
	return b
}

func (b *Buildr) Model(model ModelID) *Buildr {
	b.v.model = model
	return b
}

func (b *Buildr) Project(project ProjectID) *Buildr {
	b.v.project = project
	return b
}

func (b *Buildr) Sort(sort *Sort) *Buildr {
	b.v.sort = sort
	return b
}

func (b *Buildr) Filter(filter *Condition) *Buildr {
	b.v.filter = filter
	return b
}

func (b *Buildr) Columns(columns *ColumnList) *Buildr {
	b.v.columns = columns
	return b
}

func (b *Buildr) User(user UserID) *Buildr {
	b.v.user = user
	return b
}

func (b *Buildr) UpdatedAt(updatedAt time.Time) *Buildr {
	b.v.updatedAt = updatedAt
	return b
}
