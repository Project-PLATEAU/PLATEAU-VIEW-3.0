package view

type NullableOperator string

const (
	NullableOperatorEmpty    NullableOperator = "EMPTY"
	NullableOperatorNotEmpty NullableOperator = "NOT_EMPTY"
)

type NullableCondition struct {
	Field FieldSelector
	Op    NullableOperator
}
