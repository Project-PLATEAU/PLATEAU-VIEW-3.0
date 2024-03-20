package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/samber/lo"
)

func ToView(i *view.View) *View {
	if i == nil {
		return nil
	}
	return &View{
		ID:        IDFrom[id.View](i.ID()),
		Name:      i.Name(),
		ProjectID: IDFrom[id.Project](i.Project()),
		ModelID:   IDFrom[id.Model](i.Model()),
		Filter:    ToFilter(i.Filter()),
		Sort:      ToSort(i.Sort()),
		Columns:   ToFieldSelectorList(i.Columns()),
	}
}

func ToFieldSelector(field view.FieldSelector) *FieldSelector {
	fs := &FieldSelector{
		Type: ToFieldType(field.Type),
		ID:   nil,
	}
	if field.Type == view.FieldTypeField || field.Type == view.FieldTypeMetaField {
		fs.ID = IDFromRef(field.ID)
	}
	return fs
}

func ToFieldType(fieldType view.FieldType) FieldType {
	switch fieldType {
	case view.FieldTypeId:
		return FieldTypeID
	case view.FieldTypeCreationDate:
		return FieldTypeCreationDate
	case view.FieldTypeModificationDate:
		return FieldTypeModificationDate
	case view.FieldTypeStatus:
		return FieldTypeStatus
	case view.FieldTypeCreationUser:
		return FieldTypeCreationUser
	case view.FieldTypeModificationUser:
		return FieldTypeModificationUser
	case view.FieldTypeField:
		return FieldTypeField
	case view.FieldTypeMetaField:
		return FieldTypeMetaField
	default:
		return FieldTypeID
	}
}

func ToDirection(direction view.Direction) *SortDirection {
	switch direction {
	case view.DirectionAsc:
		return lo.ToPtr(SortDirectionAsc)
	case view.DirectionDesc:
		return lo.ToPtr(SortDirectionDesc)
	default:
		return nil
	}
}

func ToFieldSelectorList(columns *view.ColumnList) []*Column {
	if columns == nil {
		return nil
	}
	return lo.Map(*columns, func(c view.Column, _ int) *Column {
		return &Column{
			Field:   ToFieldSelector(c.Field),
			Visible: c.Visible,
		}
	})
}

func ToSort(i *view.Sort) *ItemSort {
	if i == nil {
		return nil
	}
	return &ItemSort{
		Field:     ToFieldSelector(i.Field),
		Direction: ToDirection(i.Direction),
	}
}

func ToFilter(i *view.Condition) Condition {
	if i == nil {
		return nil
	}
	if i.BasicCondition != nil {
		return BasicFieldCondition{
			FieldID:  ToFieldSelector(i.BasicCondition.Field),
			Operator: BasicOperator(i.BasicCondition.Op),
			Value:    i.BasicCondition.Value,
		}
	}
	if i.NullableCondition != nil {
		return NullableFieldCondition{
			FieldID:  ToFieldSelector(i.NullableCondition.Field),
			Operator: NullableOperator(i.NullableCondition.Op),
		}
	}
	if i.MultipleCondition != nil {
		return MultipleFieldCondition{
			FieldID:  ToFieldSelector(i.MultipleCondition.Field),
			Operator: MultipleOperator(i.MultipleCondition.Op),
			Value:    i.MultipleCondition.Value,
		}
	}
	if i.BoolCondition != nil {
		return BoolFieldCondition{
			FieldID:  ToFieldSelector(i.BoolCondition.Field),
			Operator: BoolOperator(i.BoolCondition.Op),
			Value:    i.BoolCondition.Value,
		}
	}
	if i.StringCondition != nil {
		return StringFieldCondition{
			FieldID:  ToFieldSelector(i.StringCondition.Field),
			Operator: StringOperator(i.StringCondition.Op),
			Value:    i.StringCondition.Value,
		}
	}
	if i.NumberCondition != nil {
		return NumberFieldCondition{
			FieldID:  ToFieldSelector(i.NumberCondition.Field),
			Operator: NumberOperator(i.NumberCondition.Op),
			Value:    i.NumberCondition.Value,
		}
	}
	if i.TimeCondition != nil {
		return TimeFieldCondition{
			FieldID:  ToFieldSelector(i.TimeCondition.Field),
			Operator: TimeOperator(i.TimeCondition.Op),
			Value:    i.TimeCondition.Value,
		}
	}

	if i.AndCondition != nil {
		return AndCondition{
			Conditions: lo.Map(i.AndCondition.Conditions, func(c view.Condition, _ int) Condition {
				return ToFilter(&c)
			}),
		}
	}
	if i.OrCondition != nil {
		return OrCondition{
			Conditions: lo.Map(i.OrCondition.Conditions, func(c view.Condition, _ int) Condition {
				return ToFilter(&c)
			}),
		}
	}
	return nil
}

func (s *ItemSortInput) Into() *view.Sort {
	if s == nil {
		return nil
	}
	return &view.Sort{
		Field:     s.Field.Into(),
		Direction: s.Direction.Into(),
	}
}

func (s *SortDirection) Into() view.Direction {
	if s != nil && *s == SortDirectionAsc {
		return view.DirectionAsc
	}
	return view.DirectionDesc
}

func (e FieldType) Into() view.FieldType {
	switch e {
	case FieldTypeID:
		return view.FieldTypeId
	case FieldTypeCreationDate:
		return view.FieldTypeCreationDate
	case FieldTypeModificationDate:
		return view.FieldTypeModificationDate
	case FieldTypeStatus:
		return view.FieldTypeStatus
	case FieldTypeCreationUser:
		return view.FieldTypeCreationUser
	case FieldTypeModificationUser:
		return view.FieldTypeModificationUser
	case FieldTypeField:
		return view.FieldTypeField
	case FieldTypeMetaField:
		return view.FieldTypeMetaField
	default:
		return view.FieldTypeId
	}
}

func (i FieldSelectorInput) Into() view.FieldSelector {
	return view.FieldSelector{
		Type: i.Type.Into(),
		ID:   ToIDRef[id.Field](i.ID),
	}
}

func (i ColumnSelectionInput) Into() view.Column {
	return view.Column{
		Field:   i.Field.Into(),
		Visible: i.Visible,
	}
}

func (i *ConditionInput) Into() *view.Condition {
	if i == nil {
		return nil
	}
	if i.Bool != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeBool,
			BoolCondition: &view.BoolCondition{
				Field: i.Bool.FieldID.Into(),
				Op:    i.Bool.Operator.Into(),
				Value: i.Bool.Value,
			},
		}
	}
	if i.String != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeString,
			StringCondition: &view.StringCondition{
				Field: i.String.FieldID.Into(),
				Op:    i.String.Operator.Into(),
				Value: i.String.Value,
			},
		}
	}
	if i.Number != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeNumber,
			NumberCondition: &view.NumberCondition{
				Field: i.Number.FieldID.Into(),
				Op:    i.Number.Operator.Into(),
				Value: i.Number.Value,
			},
		}
	}
	if i.Basic != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeBasic,
			BasicCondition: &view.BasicCondition{
				Field: i.Basic.FieldID.Into(),
				Op:    i.Basic.Operator.Into(),
				Value: i.Basic.Value,
			},
		}
	}
	if i.Time != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeTime,
			TimeCondition: &view.TimeCondition{
				Field: i.Time.FieldID.Into(),
				Op:    i.Time.Operator.Into(),
				Value: i.Time.Value,
			},
		}
	}
	if i.Nullable != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeNullable,
			NullableCondition: &view.NullableCondition{
				Field: i.Nullable.FieldID.Into(),
				Op:    i.Nullable.Operator.Into(),
			},
		}
	}
	if i.Multiple != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeMultiple,
			MultipleCondition: &view.MultipleCondition{
				Field: i.Multiple.FieldID.Into(),
				Op:    i.Multiple.Operator.Into(),
				Value: i.Multiple.Value,
			},
		}
	}
	if i.And != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeAnd,
			AndCondition: &view.AndCondition{
				Conditions: lo.Map(i.And.Conditions, func(c *ConditionInput, _ int) view.Condition {
					return *c.Into()
				}),
			},
		}
	}
	if i.Or != nil {
		return &view.Condition{
			ConditionType: view.ConditionTypeOr,
			OrCondition: &view.OrCondition{
				Conditions: lo.Map(i.Or.Conditions, func(c *ConditionInput, _ int) view.Condition {
					return *c.Into()
				}),
			},
		}
	}

	return nil
}

func (e BoolOperator) Into() view.BoolOperator {
	switch e {
	case BoolOperatorEquals:
		return view.BoolOperatorEquals
	case BoolOperatorNotEquals:
		return view.BoolOperatorNotEquals
	default:
		return ""
	}
}

func (e StringOperator) Into() view.StringOperator {
	switch e {
	case StringOperatorContains:
		return view.StringOperatorContains
	case StringOperatorNotContains:
		return view.StringOperatorNotContains
	case StringOperatorStartsWith:
		return view.StringOperatorStartsWith
	case StringOperatorNotStartsWith:
		return view.StringOperatorNotStartsWith
	case StringOperatorEndsWith:
		return view.StringOperatorEndsWith
	case StringOperatorNotEndsWith:
		return view.StringOperatorNotEndsWith
	default:
		return ""
	}
}

func (e NumberOperator) Into() view.NumberOperator {
	switch e {
	case NumberOperatorGreaterThan:
		return view.NumberOperatorGreaterThan
	case NumberOperatorGreaterThanOrEqualTo:
		return view.NumberOperatorGreaterThanOrEqualTo
	case NumberOperatorLessThan:
		return view.NumberOperatorLessThan
	case NumberOperatorLessThanOrEqualTo:
		return view.NumberOperatorLessThanOrEqualTo
	default:
		return ""
	}
}

func (e BasicOperator) Into() view.BasicOperator {
	switch e {
	case BasicOperatorEquals:
		return view.BasicOperatorEquals
	case BasicOperatorNotEquals:
		return view.BasicOperatorNotEquals
	default:
		return ""
	}
}

func (e TimeOperator) Into() view.TimeOperator {
	switch e {
	case TimeOperatorAfter:
		return view.TimeOperatorAfter
	case TimeOperatorAfterOrOn:
		return view.TimeOperatorAfterOrOn
	case TimeOperatorBefore:
		return view.TimeOperatorBefore
	case TimeOperatorBeforeOrOn:
		return view.TimeOperatorBeforeOrOn
	case TimeOperatorOfThisWeek:
		return view.TimeOperatorOfThisWeek
	case TimeOperatorOfThisMonth:
		return view.TimeOperatorOfThisMonth
	case TimeOperatorOfThisYear:
		return view.TimeOperatorOfThisYear
	default:
		return ""
	}
}

func (e NullableOperator) Into() view.NullableOperator {
	switch e {
	case NullableOperatorEmpty:
		return view.NullableOperatorEmpty
	case NullableOperatorNotEmpty:
		return view.NullableOperatorNotEmpty
	default:
		return ""
	}
}

func (e MultipleOperator) Into() view.MultipleOperator {
	switch e {
	case MultipleOperatorIncludesAny:
		return view.MultipleOperatorIncludesAny
	case MultipleOperatorNotIncludesAny:
		return view.MultipleOperatorNotIncludesAny
	case MultipleOperatorIncludesAll:
		return view.MultipleOperatorIncludesAll
	case MultipleOperatorNotIncludesAll:
		return view.MultipleOperatorNotIncludesAll

	default:
		return ""
	}
}
