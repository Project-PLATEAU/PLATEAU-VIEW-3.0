package view

type BasicOperator string

const (
	BasicOperatorEquals    BasicOperator = "EQUALS"
	BasicOperatorNotEquals BasicOperator = "NOT_EQUALS"
)

type BasicCondition struct {
	Field FieldSelector
	Op    BasicOperator
	Value any
}
