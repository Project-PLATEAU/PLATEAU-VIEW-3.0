package view

type BoolOperator string

const (
	BoolOperatorEquals    BoolOperator = "EQUALS"
	BoolOperatorNotEquals BoolOperator = "NOT_EQUALS"
)

type BoolCondition struct {
	Field FieldSelector
	Op    BoolOperator
	Value bool
}
