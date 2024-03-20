package view

import "time"

type TimeOperator string

const (
	TimeOperatorBefore      TimeOperator = "BEFORE"
	TimeOperatorAfter       TimeOperator = "AFTER"
	TimeOperatorBeforeOrOn  TimeOperator = "BEFORE_OR_ON"
	TimeOperatorAfterOrOn   TimeOperator = "AFTER_OR_ON"
	TimeOperatorOfThisWeek  TimeOperator = "OF_THIS_WEEK"
	TimeOperatorOfThisMonth TimeOperator = "OF_THIS_MONTH"
	TimeOperatorOfThisYear  TimeOperator = "OF_THIS_YEAR"
)

type TimeCondition struct {
	Field FieldSelector
	Op    TimeOperator
	Value time.Time
}
