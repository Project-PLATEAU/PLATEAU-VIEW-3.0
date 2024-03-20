package plateauv2

import (
	"fmt"
	"path"
	"regexp"
	"strconv"
	"strings"

	"github.com/samber/lo"
)

var reAssetName = regexp.MustCompile(`^([0-9]+?)_(.+?)_(.+?)_(.+?)_((?:[0-9]+?_)*(?:op)?[0-9]*(?:_[0-9]+?)*)(_nodem)?(?:_(.+?)(?:_(.+))?)?$`)
var reLod = regexp.MustCompile(`(^|.*_)lod([0-9]+?)`)
var reWard = regexp.MustCompile(`^([0-9]+?)_([a-zA-Z].+)`)
var reFldScale = regexp.MustCompile(`^l[0-9]+$`)

type AssetName struct {
	CityCode       string
	CityEn         string
	Year           string
	Format         string
	Op             string
	NoDEM          bool
	Feature        string
	FeatureEx      []string
	Ex             string
	Ext            string
	WardCode       string
	WardEn         string
	LOD            string
	LowTexture     bool
	NoTexture      bool
	FldAdmin       string
	FldName        string
	FldScale       string
	UrfFeatureType string
	GenName        string
}

func (an AssetName) LODInt() int {
	i, _ := strconv.Atoi(an.LOD)
	return i
}

func (an AssetName) WardCodeInt() int {
	i, _ := strconv.Atoi(an.WardCode)
	return i
}

func (an AssetName) FldFullName() string {
	return strings.Join(lo.Filter([]string{an.FldAdmin, an.FldName, an.FldScale}, func(s string, _ int) bool { return s != "" }), "_")
}

func (an AssetName) FldAdminAndName() string {
	return strings.Join(lo.Filter([]string{an.FldAdmin, an.FldName}, func(s string, _ int) bool { return s != "" }), "_")
}

func (an AssetName) FldNameAndScale() string {
	return strings.Join(lo.Filter([]string{an.FldName, an.FldScale}, func(s string, _ int) bool { return s != "" }), "_")
}

func AssetNameFrom(name string) (a AssetName) {
	a.Ext = path.Ext(name)
	name = strings.TrimSuffix(name, a.Ext)
	name = path.Base(name)
	m := reAssetName.FindStringSubmatch(name)
	if len(m) < 2 {
		return
	}

	a.CityCode = m[1]
	a.CityEn = m[2]
	a.Year = m[3]
	a.Format = strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(m[4], " ", ""), "%20", ""), "+", "")
	a.Op = m[5]
	if m[6] != "" {
		a.NoDEM = true
	}
	if len(m) > 7 {
		a.Feature = m[7]
		if strings.HasPrefix(a.Feature, "ex-") {
			a.FeatureEx = strings.Split(a.Feature, "-")[1:]
			a.Feature = "ex"
		}
		if len(m) > 8 {
			a.Ex = m[8]
		}
	}

	a.LowTexture = strings.HasSuffix(a.Ex, "_low_texture")
	if a.LowTexture {
		a.Ex = strings.TrimSuffix(a.Ex, "_low_texture")
	}

	a.NoTexture = strings.HasSuffix(a.Ex, "_no_texture") || a.Ex == "no_texture"
	if a.NoTexture {
		if a.Ex == "no_texture" {
			a.Ex = ""
		} else {
			a.Ex = strings.TrimSuffix(a.Ex, "_no_texture")
		}
	}

	lodm := reLod.FindStringSubmatch(a.Ex)
	if len(lodm) == 3 {
		a.LOD = lodm[2]
		a.Ex = strings.TrimSuffix(lodm[1], "_")
	}

	wardm := reWard.FindStringSubmatch(a.Ex)
	if len(wardm) == 3 {
		a.WardCode = wardm[1]
		warden, ex, _ := strings.Cut(wardm[2], "_")
		a.WardEn = warden
		a.Ex = ex
	}

	switch a.Feature {
	case "fld":
		fldElements := strings.Split(a.Ex, "_")
		if len(fldElements) > 1 {
			a.FldAdmin = fldElements[0]
			last := fldElements[len(fldElements)-1]
			if reFldScale.MatchString(last) {
				a.FldScale = last
				a.FldName = strings.Join(fldElements[1:len(fldElements)-1], "_")
			} else {
				a.FldName = strings.Join(fldElements[1:], "_")
			}
		} else {
			a.FldName = a.Ex
		}
		a.Ex = ""
	case "htd":
		fallthrough
	case "ifld":
		fallthrough
	case "tnm":
		a.FldName = a.Ex
		a.Ex = ""
	case "urf":
		a.UrfFeatureType = a.Ex
		a.Ex = ""
	case "gen":
		a.GenName = a.Ex
		a.Ex = ""
	}

	return
}

func (a AssetName) String() string {
	lod, texture := "", ""
	feature := a.Feature
	if len(a.FeatureEx) > 0 {
		feature = strings.Join(append([]string{a.Feature}, a.FeatureEx...), "-")
	}
	if a.LOD != "" {
		lod = fmt.Sprintf("lod%s", a.LOD)
	}
	if a.NoTexture {
		texture = "no_texture"
	}
	if a.LowTexture {
		texture = "low_texture"
	}
	return strings.Join(lo.Filter([]string{
		a.CityCode,
		a.CityEn,
		a.Year,
		a.Format,
		a.Op,
		feature,
		a.WardCode,
		a.WardEn,
		a.FldAdmin,
		a.FldName,
		a.UrfFeatureType,
		a.GenName,
		a.Ex,
		lod,
		texture,
	}, func(s string, _ int) bool { return s != "" }), "_") + a.Ext
}

func (a AssetName) IsWard() bool {
	return a.WardCode != ""
}

func (a AssetName) CityOrWardCode() string {
	if a.IsWard() {
		return a.WardCode
	}
	return a.CityCode
}
