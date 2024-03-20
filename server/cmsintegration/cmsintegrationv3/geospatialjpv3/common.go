package geospatialjpv3

import (
	"regexp"
	"strconv"
	"strings"

	"github.com/k0kubun/pp/v3"
)

type Config struct {
	CkanBase       string
	CkanOrg        string
	CkanToken      string
	CMSBase        string
	CMSToken       string
	CMSIntegration string
	BuildType      string
	// cloud run jobs
	CloudRunJobsJobName string
	// cloud build image
	CloudBuildImage       string
	CloudBuildMachineType string
	CloudBuildProject     string
	CloudBuildRegion      string
	CloudBuildDiskSizeGb  int64
}

var ppp *pp.PrettyPrinter

func init() {
	ppp = pp.New()
	ppp.SetColoringEnabled(false)
}

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

func SpecVersion(version string) string {
	return strings.TrimSuffix(strings.TrimPrefix(version, "第"), "版")
}
