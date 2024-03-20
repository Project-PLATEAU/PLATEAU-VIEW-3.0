package view

import "github.com/samber/lo"

type ConditionType string

const (
	ConditionTypeAnd      ConditionType = "AND"
	ConditionTypeOr       ConditionType = "OR"
	ConditionTypeBasic    ConditionType = "BASIC"
	ConditionTypeNullable ConditionType = "NULLABLE"
	ConditionTypeMultiple ConditionType = "MULTIPLE"
	ConditionTypeBool     ConditionType = "BOOL"
	ConditionTypeString   ConditionType = "STRING"
	ConditionTypeNumber   ConditionType = "NUMBER"
	ConditionTypeTime     ConditionType = "TIME"
)

type Condition struct {
	ConditionType     ConditionType
	AndCondition      *AndCondition
	OrCondition       *OrCondition
	BasicCondition    *BasicCondition
	NullableCondition *NullableCondition
	MultipleCondition *MultipleCondition
	BoolCondition     *BoolCondition
	StringCondition   *StringCondition
	NumberCondition   *NumberCondition
	TimeCondition     *TimeCondition
}

func (c Condition) MetaFields() FieldSelectorList {
	return c.FieldsByType(FieldTypeMetaField)
}

func (c Condition) ItemFields() FieldSelectorList {
	return c.FieldsByType(FieldTypeField)
}

func (c Condition) FieldsByType(t FieldType) FieldSelectorList {
	var res []FieldSelector

	switch c.ConditionType {
	case ConditionTypeAnd:
		res = append(res, lo.FlatMap(c.AndCondition.Conditions, func(c Condition, _ int) []FieldSelector {
			return c.FieldsByType(t)
		})...)
	case ConditionTypeOr:
		res = append(res, lo.FlatMap(c.OrCondition.Conditions, func(c Condition, _ int) []FieldSelector {
			return c.FieldsByType(t)
		})...)
	case ConditionTypeBasic:
		if c.BasicCondition.Field.Type == t {
			res = append(res, c.BasicCondition.Field)
		}
	case ConditionTypeNullable:
		if c.NullableCondition.Field.Type == t {
			res = append(res, c.NullableCondition.Field)
		}
	case ConditionTypeMultiple:
		if c.MultipleCondition.Field.Type == t {
			res = append(res, c.MultipleCondition.Field)
		}
	case ConditionTypeBool:
		if c.BoolCondition.Field.Type == t {
			res = append(res, c.BoolCondition.Field)
		}
	case ConditionTypeString:
		if c.StringCondition.Field.Type == t {
			res = append(res, c.StringCondition.Field)
		}
	case ConditionTypeNumber:
		if c.NumberCondition.Field.Type == t {
			res = append(res, c.NumberCondition.Field)
		}
	case ConditionTypeTime:
		if c.TimeCondition.Field.Type == t {
			res = append(res, c.TimeCondition.Field)
		}
	}
	return res
}
