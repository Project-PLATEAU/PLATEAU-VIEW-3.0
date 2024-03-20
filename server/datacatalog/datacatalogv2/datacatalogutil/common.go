package datacatalogutil

import (
	"fmt"
	"net/url"
	"path"
	"regexp"
	"strconv"
	"strings"

	"github.com/eukarya-inc/jpareacode"
)

const tokyo23ku = "東京都23区"

func AssetURLFromFormat(u, f string) string {
	u2, err := url.Parse(u)
	if err != nil {
		return u
	}

	dir := path.Dir(u2.Path)
	ext := path.Ext(u2.Path)
	base := path.Base(u2.Path)
	name := strings.TrimSuffix(base, ext)
	isArchive := ext == ".zip" || ext == ".7z"

	u2.Path = AssetRootPath(u2.Path)
	if f == "3dtiles" {
		if !isArchive {
			// not CMS asset
			return u
		}

		u2.Path = path.Join(u2.Path, "tileset.json")
		return u2.String()
	} else if f == "tiles" || f == "mvt" {
		us := ""
		if !isArchive {
			// not CMS asset
			us = u
		} else {
			ext := ""
			if f == "mvt" {
				ext = "mvt"
			} else {
				ext = "png"
			}

			u2.Path = path.Join(u2.Path, "{z}/{x}/{y}."+ext)
			us = u2.String()
		}

		return strings.ReplaceAll(strings.ReplaceAll(us, "%7B", "{"), "%7D", "}")
	} else if f == "tms" {
		if !isArchive {
			// not CMS asset
			return u
		}
		return u2.String()
	} else if (f == "czml" || f == "kml") && isArchive {
		u2.Path = path.Join(dir, name, fmt.Sprintf("%s.%s", name, f))
		return u2.String()
	}
	return u
}

func AssetRootPath(p string) string {
	fn := strings.TrimSuffix(path.Base(p), path.Ext(p))
	return path.Join(path.Dir(p), fn)
}

func CityCode(code, cityName, wardName string, prefCode int) string {
	if code == "" {
		if cityName == tokyo23ku && wardName == "" {
			return "13100"
		}
		if cityName == tokyo23ku {
			cityName = ""
		}

		city := jpareacode.CityByName(prefCode, cityName, wardName)
		if city == nil {
			return ""
		}

		return jpareacode.FormatCityCode(city.Code())
	}
	return code
}

func IsLayerSupported(format string) bool {
	switch format {
	case "mvt", "wms":
		return true
	}
	return false
}

var reReiwa = regexp.MustCompile(`令和([0-9]+?)年度`)

func YearInt(y string) (year int) {
	if ym := reReiwa.FindStringSubmatch(y); len(ym) > 1 {
		yy, _ := strconv.Atoi(ym[1])
		if yy > 0 {
			year = yy + 2018
		}
	} else if yy, err := strconv.Atoi(strings.TrimSuffix(strings.TrimSuffix(y, "度"), "年")); err == nil {
		year = yy
	}
	return year
}

func FormatTypeEn(f string) string {
	if f == "3D Tiles" {
		return "3dtiles"
	}
	return strings.ToLower(f)
}

const Zenkyu = "全球データ"

func NormalizePref(pref string) (string, int) {
	if pref == "全球" || pref == "全国" {
		pref = Zenkyu
	}

	var prefCode int
	if pref == Zenkyu {
		prefCode = 0
	} else {
		prefCode = jpareacode.PrefectureCodeInt(pref)
	}

	return pref, prefCode
}
