package datacatalogcommon

import (
	"regexp"
	"strconv"
	"strings"
)

var reReiwa = regexp.MustCompile(`令和([0-9]+?)年度?`)

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
