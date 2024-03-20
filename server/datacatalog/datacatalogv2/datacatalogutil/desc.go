package datacatalogutil

import (
	"strings"
)

type Description struct {
	Desc string
	Tags map[string]string
}

func DescriptionFrom(d string) Description {
	tags, rest := extractTags(strings.TrimSpace(d))

	return Description{
		Desc: rest,
		Tags: tags,
	}
}

func extractTags(s string) (map[string]string, string) {
	s = strings.TrimSpace(s)
	lines := strings.Split(s, "\n")
	tags := map[string]string{}

	last := -1
	for i, l := range lines {
		if l != "" && !strings.HasPrefix(l, "@") {
			break
		}

		if l == "" {
			last = i
			continue
		}

		l = strings.TrimSpace(strings.TrimPrefix(l, "@"))
		k, v, found := strings.Cut(l, ":")
		if !found {
			break
		}

		tags[k] = strings.TrimSpace(v)
		last = i
	}

	if last == -1 {
		return tags, s
	}

	rest := strings.TrimSpace(strings.Join(lines[last+1:], "\n"))
	return tags, rest
}
