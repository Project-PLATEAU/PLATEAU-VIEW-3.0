package view

type MultipleOperator string

const (
	MultipleOperatorIncludesAny    MultipleOperator = "INCLUDES_ANY"
	MultipleOperatorNotIncludesAny MultipleOperator = "NOT_INCLUDES_ANY"
	MultipleOperatorIncludesAll    MultipleOperator = "INCLUDES_ALL"
	MultipleOperatorNotIncludesAll MultipleOperator = "NOT_INCLUDES_ALL"
)

type MultipleCondition struct {
	Field FieldSelector
	Op    MultipleOperator
	Value []any
}
