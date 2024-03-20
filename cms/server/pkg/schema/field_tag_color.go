package schema

import "strings"

type TagColor string

const (
	TagColorMagenta  TagColor = "magenta"
	TagColorRed      TagColor = "red"
	TagColorVolcano  TagColor = "volcano"
	TagColorOrange   TagColor = "orange"
	TagColorGold     TagColor = "gold"
	TagColorLime     TagColor = "lime"
	TagColorGreen    TagColor = "green"
	TagColorCyan     TagColor = "cyan"
	TagColorBlue     TagColor = "blue"
	TagColorGeekblue TagColor = "geekblue"
	TagColorPurple   TagColor = "purple"
)

func (s TagColor) String() string {
	return string(s)
}

func TagColorFrom(s string) TagColor {
	ss := strings.ToLower(s)
	switch TagColor(ss) {
	case TagColorMagenta:
		return TagColorMagenta
	case TagColorRed:
		return TagColorRed
	case TagColorVolcano:
		return TagColorVolcano
	case TagColorOrange:
		return TagColorOrange
	case TagColorGreen:
		return TagColorGreen
	case TagColorGold:
		return TagColorGold
	case TagColorLime:
		return TagColorLime
	case TagColorCyan:
		return TagColorCyan
	case TagColorBlue:
		return TagColorBlue
	case TagColorGeekblue:
		return TagColorGeekblue
	case TagColorPurple:
		return TagColorPurple

	default:
		return TagColor("")
	}
}
