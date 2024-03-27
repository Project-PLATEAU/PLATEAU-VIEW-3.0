package cmsintegrationv3

import (
	"fmt"
	"strings"

	cms "github.com/reearth/reearth-cms-api/go"
)

func tagIs(t *cms.Tag, v fmt.Stringer) bool {
	return t != nil && t.Name == v.String()
}

func tagIsNot(t *cms.Tag, v fmt.Stringer) bool {
	return t != nil && t.Name != v.String()
}

func tagFrom(t fmt.Stringer) *cms.Tag {
	s := t.String()
	if s == "" {
		return nil
	}
	return &cms.Tag{
		Name: s,
	}
}

func getLastBracketContent(s string) string {
	if strings.Contains(s, "（") && strings.Contains(s, "）") {
		_, s := cutStringRight(s, "（")
		s, _, _ = strings.Cut(s, "）")
		return s
	}

	return ""
}

func cutStringRight(s string, sep string) (string, string) {
	if i := strings.LastIndex(s, sep); i >= 0 {
		return s[:i], s[i+len(sep):]
	}
	return s, ""
}
