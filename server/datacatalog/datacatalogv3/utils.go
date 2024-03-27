package datacatalogv3

import "strings"

func getLastBracketContent(s string) (string, string) {
	if strings.Contains(s, "（") && strings.Contains(s, "）") {
		name, s := cutStringRight(s, "（")
		s, _, _ = strings.Cut(s, "）")
		return name, s
	}

	return "", ""
}

func cutStringRight(s string, sep string) (string, string) {
	if i := strings.LastIndex(s, sep); i >= 0 {
		return s[:i], s[i+len(sep):]
	}
	return s, ""
}
