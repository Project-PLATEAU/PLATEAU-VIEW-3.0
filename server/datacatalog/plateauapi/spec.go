package plateauapi

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/samber/lo"
)

type PlateauSpecSimple struct {
	MajorVersion  int
	Year          int
	MinorVersions []string
}

func PlateauSpecsFrom(specs []PlateauSpecSimple) (res []PlateauSpec) {
	for _, spec := range specs {
		id := ID(fmt.Sprintf("ps_%d", spec.MajorVersion))
		res = append(res, PlateauSpec{
			ID:           id,
			MajorVersion: spec.MajorVersion,
			Year:         spec.Year,
			MinorVersions: lo.Map(spec.MinorVersions, func(v string, _ int) *PlateauSpecMinor {
				return &PlateauSpecMinor{
					ID:           ID("ps_" + v),
					Name:         "第" + v + "版",
					Version:      v,
					MajorVersion: spec.MajorVersion,
					Year:         spec.Year,
					ParentID:     id,
				}
			}),
		})
	}

	return
}

func PlateauSpecIDFrom(version string) ID {
	return NewID(SpecNumber(version), TypePlateauSpec)
}

func PlateauSpecMajorIDFrom(version string) ID {
	return NewID(MajorVersion(version), TypePlateauSpec)
}

func MajorVersion(version string) string {
	v := SpecNumber(version)
	i := strings.Index(v, ".")
	if i < 0 {
		return version
	}
	return v[:i]
}

var reSpecVersion = regexp.MustCompile(`\d+(\.\d+)?`)

func SpecNumber(spec string) string {
	if spec == "" {
		return ""
	}

	return reSpecVersion.FindString(spec)
}
