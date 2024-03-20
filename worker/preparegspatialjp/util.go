package preparegspatialjp

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/dustin/go-humanize"
	"github.com/k0kubun/pp/v3"
	"github.com/reearth/reearthx/log"
	"github.com/ricochet2200/go-disk-usage/du"
)

var ppp *pp.PrettyPrinter

func init() {
	ppp = pp.New()
	ppp.SetColoringEnabled(false)
}

type StringOrNumber struct {
	Value string
}

func (s *StringOrNumber) UnmarshalJSON(b []byte) error {
	var str string
	if err := json.Unmarshal(b, &str); err == nil {
		s.Value = str
		return nil
	}

	var in int
	if err := json.Unmarshal(b, &in); err == nil {
		s.Value = fmt.Sprintf("%d", in)
		return nil
	}

	var num float64
	if err := json.Unmarshal(b, &num); err == nil {
		s.Value = fmt.Sprintf("%f", num)
		return nil
	}

	return nil
}

func (s *StringOrNumber) String() string {
	if s == nil {
		return ""
	}
	return s.Value
}

func isNumeric(s rune) bool {
	return strings.ContainsRune("0123456789", s)
}

func reportDiskUsage(path string) {
	usage := du.NewDiskUsage(path)
	if usage == nil {
		return
	}

	p := float64(usage.Usage()) * 100
	used := humanize.Bytes(usage.Used())
	size := humanize.Bytes(usage.Size())
	log.Debugf("Disk usage: %s / %s (%s %%)", used, size, strconv.FormatFloat(p, 'f', 2, 32))
}
