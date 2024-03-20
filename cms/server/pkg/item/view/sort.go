package view

type Direction string

const (
	DirectionAsc  Direction = "ASC"
	DirectionDesc Direction = "DESC"
)

type Sort struct {
	Field     FieldSelector
	Direction Direction
}
