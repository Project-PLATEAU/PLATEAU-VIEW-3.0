package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
)

type ViewDocument struct {
	ID        string
	Name      string
	User      string
	Project   string
	ModelId   string
	Schema    string
	Sort      *SortDocument
	Filter    *FilterDocument
	Columns   []ColumnDocument
	UpdatedAt time.Time
}

type FieldSelectorDocument struct {
	Field *string
	Type  string
}

func NewFieldSelector(i view.FieldSelector) FieldSelectorDocument {
	return FieldSelectorDocument{
		Field: i.ID.StringRef(),
		Type:  string(i.Type),
	}
}

func (d FieldSelectorDocument) Model() view.FieldSelector {
	return view.FieldSelector{
		Type: view.FieldType(d.Type),
		ID:   id.FieldIDFromRef(d.Field),
	}
}

type ColumnDocument struct {
	Field   FieldSelectorDocument
	Visible bool
}

func NewColumn(i view.Column) ColumnDocument {
	return ColumnDocument{
		Field:   NewFieldSelector(i.Field),
		Visible: i.Visible,
	}
}

func (d *ColumnDocument) Model() view.Column {
	return view.Column{
		Field:   d.Field.Model(),
		Visible: d.Visible,
	}
}

type SortDocument struct {
	Field     FieldSelectorDocument
	Direction string
}

func NewSort(i *view.Sort) *SortDocument {
	if i == nil {
		return nil
	}

	return &SortDocument{
		Field:     NewFieldSelector(i.Field),
		Direction: string(i.Direction),
	}
}

func (d *SortDocument) Model() *view.Sort {
	if d == nil {
		return nil
	}

	return &view.Sort{
		Field:     d.Field.Model(),
		Direction: view.Direction(d.Direction),
	}
}

type FilterDocument struct {
	ConditionType     string
	AndCondition      *AndConditionDocument
	OrCondition       *OrConditionDocument
	BasicCondition    *BasicConditionDocument
	NullableCondition *NullableConditionDocument
	MultipleCondition *MultipleConditionDocument
	BoolCondition     *BoolConditionDocument
	StringCondition   *StringConditionDocument
	NumberCondition   *NumberConditionDocument
	TimeCondition     *TimeConditionDocument
}

func NewFilter(i *view.Condition) *FilterDocument {
	if i == nil {
		return nil
	}

	switch {
	case i.AndCondition != nil:
		return &FilterDocument{
			ConditionType: "AND",
			AndCondition: &AndConditionDocument{
				Conditions: lo.Map(i.AndCondition.Conditions, func(c view.Condition, _ int) FilterDocument { return *NewFilter(&c) }),
			},
		}
	case i.OrCondition != nil:
		return &FilterDocument{
			ConditionType: "OR",
			OrCondition: &OrConditionDocument{
				Conditions: lo.Map(i.OrCondition.Conditions, func(c view.Condition, _ int) FilterDocument { return *NewFilter(&c) }),
			},
		}
	case i.BasicCondition != nil:
		return &FilterDocument{
			ConditionType: "BASIC",
			BasicCondition: &BasicConditionDocument{
				Field: NewFieldSelector(i.BasicCondition.Field),
				Op:    string(i.BasicCondition.Op),
				Value: i.BasicCondition.Value,
			},
		}
	case i.NullableCondition != nil:
		return &FilterDocument{
			ConditionType: "NULLABLE",
			NullableCondition: &NullableConditionDocument{
				Field: NewFieldSelector(i.NullableCondition.Field),
				Op:    string(i.NullableCondition.Op),
			},
		}
	case i.MultipleCondition != nil:
		return &FilterDocument{
			ConditionType: "MULTIPLE",
			MultipleCondition: &MultipleConditionDocument{
				Field: NewFieldSelector(i.MultipleCondition.Field),
				Op:    string(i.MultipleCondition.Op),
				Value: i.MultipleCondition.Value,
			},
		}
	case i.BoolCondition != nil:
		return &FilterDocument{
			ConditionType: "BOOL",
			BoolCondition: &BoolConditionDocument{
				Field: NewFieldSelector(i.BoolCondition.Field),
				Op:    string(i.BoolCondition.Op),
				Value: i.BoolCondition.Value,
			},
		}
	case i.StringCondition != nil:
		return &FilterDocument{
			ConditionType: "STRING",
			StringCondition: &StringConditionDocument{
				Field: NewFieldSelector(i.StringCondition.Field),
				Op:    string(i.StringCondition.Op),
				Value: i.StringCondition.Value,
			},
		}
	case i.NumberCondition != nil:
		return &FilterDocument{
			ConditionType: "NUMBER",
			NumberCondition: &NumberConditionDocument{
				Field: NewFieldSelector(i.NumberCondition.Field),
				Op:    string(i.NumberCondition.Op),
				Value: i.NumberCondition.Value,
			},
		}
	case i.TimeCondition != nil:
		return &FilterDocument{
			ConditionType: "TIME",
			TimeCondition: &TimeConditionDocument{
				Field: NewFieldSelector(i.TimeCondition.Field),
				Op:    string(i.TimeCondition.Op),
				Value: i.TimeCondition.Value,
			},
		}
	default:
		return nil
	}
}

func (d *FilterDocument) Model() *view.Condition {
	if d == nil {
		return nil
	}

	switch d.ConditionType {
	case "AND":
		return &view.Condition{
			AndCondition: &view.AndCondition{
				Conditions: lo.Map(d.AndCondition.Conditions, func(c FilterDocument, _ int) view.Condition { return *c.Model() }),
			},
		}
	case "OR":
		return &view.Condition{
			OrCondition: &view.OrCondition{
				Conditions: lo.Map(d.OrCondition.Conditions, func(c FilterDocument, _ int) view.Condition { return *c.Model() }),
			},
		}
	case "BASIC":
		return &view.Condition{
			BasicCondition: &view.BasicCondition{
				Field: d.BasicCondition.Field.Model(),
				Op:    view.BasicOperator(d.BasicCondition.Op),
				Value: d.BasicCondition.Value,
			},
		}
	case "NULLABLE":
		return &view.Condition{
			NullableCondition: &view.NullableCondition{
				Field: d.NullableCondition.Field.Model(),
				Op:    view.NullableOperator(d.NullableCondition.Op),
			},
		}
	case "MULTIPLE":
		return &view.Condition{
			MultipleCondition: &view.MultipleCondition{
				Field: d.MultipleCondition.Field.Model(),
				Op:    view.MultipleOperator(d.MultipleCondition.Op),
				Value: d.MultipleCondition.Value,
			},
		}
	case "BOOL":
		return &view.Condition{
			BoolCondition: &view.BoolCondition{
				Field: d.BoolCondition.Field.Model(),
				Op:    view.BoolOperator(d.BoolCondition.Op),
				Value: d.BoolCondition.Value,
			},
		}
	case "STRING":
		return &view.Condition{
			StringCondition: &view.StringCondition{
				Field: d.StringCondition.Field.Model(),
				Op:    view.StringOperator(d.StringCondition.Op),
				Value: d.StringCondition.Value,
			},
		}
	case "NUMBER":
		return &view.Condition{
			NumberCondition: &view.NumberCondition{
				Field: d.NumberCondition.Field.Model(),
				Op:    view.NumberOperator(d.NumberCondition.Op),
				Value: d.NumberCondition.Value,
			},
		}
	case "TIME":
		return &view.Condition{
			TimeCondition: &view.TimeCondition{
				Field: d.TimeCondition.Field.Model(),
				Op:    view.TimeOperator(d.TimeCondition.Op),
				Value: d.TimeCondition.Value,
			},
		}
	default:
		return nil
	}
}

type AndConditionDocument struct {
	Conditions []FilterDocument
}

type OrConditionDocument struct {
	Conditions []FilterDocument
}

type BasicConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value any
}

type NullableConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
}

type MultipleConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value []any
}

type BoolConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value bool
}

type StringConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value string
}

type NumberConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value float64
}

type TimeConditionDocument struct {
	Field FieldSelectorDocument
	Op    string
	Value time.Time
}

func NewView(i *view.View) (*ViewDocument, string) {
	if i == nil {
		return nil, ""
	}
	iId := i.ID().String()

	var columns []ColumnDocument
	if i.Columns() != nil {
		columns = lo.Map(*i.Columns(), func(c view.Column, _ int) ColumnDocument {
			return NewColumn(c)
		})
	}
	return &ViewDocument{
		ID:        iId,
		Name:      i.Name(),
		User:      i.User().String(),
		Project:   i.Project().String(),
		ModelId:   i.Model().String(),
		Schema:    i.Schema().String(),
		Sort:      NewSort(i.Sort()),
		Filter:    NewFilter(i.Filter()),
		Columns:   columns,
		UpdatedAt: i.UpdatedAt(),
	}, iId
}

func (d *ViewDocument) Model() (*view.View, error) {
	vID, err := id.ViewIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	pID, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}

	mID, err := id.ModelIDFrom(d.ModelId)
	if err != nil {
		return nil, err
	}

	sID, err := id.SchemaIDFrom(d.Schema)
	if err != nil {
		return nil, err
	}

	uID, err := accountdomain.UserIDFrom(d.User)
	if err != nil {
		return nil, err
	}

	columns := lo.Map(d.Columns, func(c ColumnDocument, _ int) view.Column { return c.Model() })

	return view.New().
		ID(vID).
		Name(d.Name).
		Project(pID).
		Model(mID).
		Schema(sID).
		Sort(d.Sort.Model()).
		Filter(d.Filter.Model()).
		Columns((*view.ColumnList)(&columns)).
		User(uID).
		UpdatedAt(d.UpdatedAt).
		Build()
}

type ViewConsumer = mongox.SliceFuncConsumer[*ViewDocument, *view.View]

func NewViewConsumer() *ViewConsumer {
	return NewConsumer[*ViewDocument, *view.View]()
}
