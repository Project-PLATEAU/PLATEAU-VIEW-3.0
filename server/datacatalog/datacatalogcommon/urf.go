package datacatalogcommon

import (
	"bytes"
	_ "embed"
	"encoding/csv"

	"github.com/samber/lo"
	"github.com/spkg/bom"
)

//go:embed urf.csv
var urfFeatureTypesData []byte

// UrfFeatureTypeMap is a map of URF feature type code to name.
var UrfFeatureTypeMap map[string]string

// UrfFeatureTypes is a list of URF feature type codes.
var UrfFeatureTypes []string

func init() {
	r := csv.NewReader(bom.NewReader(bytes.NewReader(urfFeatureTypesData)))
	d := lo.Must(r.ReadAll())
	UrfFeatureTypes = make([]string, 0, len(d)-1)
	for _, c := range d[1:] {
		UrfFeatureTypes = append(UrfFeatureTypes, c[0])
	}
	UrfFeatureTypeMap = lo.SliceToMap(d[1:], func(c []string) (string, string) {
		return c[0], c[1]
	})
}
