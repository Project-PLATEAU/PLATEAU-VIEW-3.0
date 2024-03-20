package cmsintegrationcommon

import (
	"fmt"
	"regexp"
	"strconv"
)

type PRCS string

var prcsRegexp = regexp.MustCompile(`([0-9]+)系`)

const epsgStart = 6668

func (s PRCS) EPSGCode() string {
	m := prcsRegexp.FindStringSubmatch(string(s))
	if len(m) != 2 {
		return ""
	}

	c, err := strconv.Atoi(m[1])
	if err != nil {
		return ""
	}

	return fmt.Sprintf("%d", epsgStart+c)
}
