package view

type NumberOperator string

const (
	NumberOperatorGreaterThan          NumberOperator = "GREATER_THAN"
	NumberOperatorLessThan             NumberOperator = "LESS_THAN"
	NumberOperatorGreaterThanOrEqualTo NumberOperator = "GREATER_THAN_OR_EQUAL_TO"
	NumberOperatorLessThanOrEqualTo    NumberOperator = "LESS_THAN_OR_EQUAL_TO"
)

type NumberCondition struct {
	Field FieldSelector
	Op    NumberOperator
	Value float64
}
