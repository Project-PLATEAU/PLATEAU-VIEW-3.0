package datacatalogv3

import (
	"path"
	"strings"

	"github.com/samber/lo"
)

type OriginalAndConv struct {
	Original  string
	Converted string
}

func OriginalAndConvsFrom(original, converted []string) []OriginalAndConv {
	originalNames := lo.Map(original, func(u string, _ int) string {
		return nameWithoutExt(nameFromURL(u))
	})

	convertedNames := lo.Map(converted, func(u string, _ int) string {
		return nameWithoutExt(nameFromURL(u))
	})

	res := make([]OriginalAndConv, len(converted))
	for i := range converted {
		convertedName := convertedNames[i]
		_, k, _ := lo.FindIndexOf(originalNames, func(o string) bool {
			return o == convertedName
		})

		var o string
		if k >= 0 {
			o = original[k]
		}

		res[i] = OriginalAndConv{
			Original:  o,
			Converted: converted[i],
		}
	}
	return res
}

func nameFromURL(url string) string {
	if url == "" {
		return ""
	}

	if i := strings.LastIndexByte(url, '/'); i >= 0 {
		url = url[i+1:]
	}

	return url
}

func nameWithoutExt(name string) string {
	ext := path.Ext(name)
	if ext == "" {
		return name
	}

	return name[:len(name)-len(ext)]
}

func firstNonEmptyValue[T comparable](v ...T) (_ T) {
	for _, i := range v {
		if !lo.IsEmpty(i) {
			return i
		}
	}
	return
}
