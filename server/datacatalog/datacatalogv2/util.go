package datacatalogv2

import (
	"regexp"
	"strconv"
	"strings"

	"github.com/eukarya-inc/jpareacode"
)

var reReiwa = regexp.MustCompile(`令和([0-9]+?)年度`)

func yearInt(y string) (year int) {
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

func formatTypeEn(f string) string {
	if f == "3D Tiles" {
		return "3dtiles"
	}
	return strings.ToLower(f)
}

const zenkyu = "全球データ"

func normalizePref(pref string) (string, int) {
	if pref == "全球" || pref == "全国" {
		pref = zenkyu
	}

	var prefCode int
	if pref == zenkyu {
		prefCode = 0
	} else {
		prefCode = jpareacode.PrefectureCodeInt(pref)
	}

	return pref, prefCode
}
