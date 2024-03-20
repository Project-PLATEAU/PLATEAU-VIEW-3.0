package item

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
)

type Query struct {
	project id.ProjectID
	schema  *id.SchemaID
	model   id.ModelID
	q       string
	ref     *version.Ref

	sort   *view.Sort
	filter *view.Condition
}

func NewQuery(project id.ProjectID, model id.ModelID, schema *id.SchemaID, q string, ref *version.Ref) *Query {
	return &Query{
		project: project,
		schema:  schema,
		model:   model,
		q:       q,
		ref:     ref,
	}
}

func (q *Query) WithSort(sort *view.Sort) *Query {
	q.sort = sort
	return q
}

func (q *Query) WithFilter(filter *view.Condition) *Query {
	q.filter = filter
	return q
}

// Q returns keywords for search
func (q *Query) Q() string {
	return q.q
}

func (q *Query) Project() id.ProjectID {
	return q.project
}

func (q *Query) Schema() *id.SchemaID {
	return q.schema
}

func (q *Query) Model() id.ModelID {
	return q.model
}

func (q *Query) Ref() *version.Ref {
	return util.CloneRef(q.ref)
}

func (q *Query) Sort() *view.Sort {
	return q.sort
}

func (q *Query) Filter() *view.Condition {
	return q.filter
}

func (q *Query) ItemFields() view.FieldSelectorList {
	res := view.FieldSelectorList{}
	if q.filter != nil {
		res = append(res, q.filter.ItemFields()...)
	}
	if q.sort != nil && q.sort.Field.Type == view.FieldTypeField {
		res = append(res, q.sort.Field)
	}
	return res
}

func (q *Query) HasItemFields() bool {
	return len(q.ItemFields()) > 0
}

func (q *Query) MetaFields() view.FieldSelectorList {
	res := view.FieldSelectorList{}
	if q.filter != nil {
		res = append(res, q.filter.MetaFields()...)
	}
	if q.sort != nil && q.sort.Field.Type == view.FieldTypeMetaField {
		res = append(res, q.sort.Field)
	}
	return res
}

func (q *Query) HasMetaFields() bool {
	return len(q.MetaFields()) > 0
}

func (q *Query) Fields() view.FieldSelectorList {
	res := append(view.FieldSelectorList{}, q.ItemFields()...)
	res = append(res, q.MetaFields()...)
	return res
}
