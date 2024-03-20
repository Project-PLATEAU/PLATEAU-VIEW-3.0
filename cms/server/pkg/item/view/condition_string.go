package view

type StringOperator string

const (
	StringOperatorContains      StringOperator = "CONTAINS"
	StringOperatorNotContains   StringOperator = "NOT_CONTAINS"
	StringOperatorStartsWith    StringOperator = "STARTS_WITH"
	StringOperatorEndsWith      StringOperator = "ENDS_WITH"
	StringOperatorNotStartsWith StringOperator = "NOT_STARTS_WITH"
	StringOperatorNotEndsWith   StringOperator = "NOT_ENDS_WITH"
)

type StringCondition struct {
	Field FieldSelector
	Op    StringOperator
	Value string
}
