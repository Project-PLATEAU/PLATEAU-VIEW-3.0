package datacatalogv3

import (
	"bytes"
	_ "embed"
	"encoding/csv"
	"fmt"
	"io"
	"strconv"

	"github.com/spkg/bom"
)

//go:embed urf.csv
var urfFeatureTypesData []byte

type UrfType struct {
	Code       string
	Name       string
	ParentCode string
	Depth      int
}

// UrfFeatureTypeMap is a map of URF feature type code to name.
var UrfFeatureTypeMap map[string]UrfType

// UrfFeatureTypes is a list of URF feature type codes.
var UrfFeatureTypes []string

func init() {
	const columns = 3
	UrfFeatureTypeMap = make(map[string]UrfType)
	parents := []string{}
	lastCode := ""
	lastDepth := 0
	i := 0

	r := csv.NewReader(bom.NewReader(bytes.NewReader(urfFeatureTypesData)))
	r.ReuseRecord = true
	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			panic(fmt.Sprintf("failed to read URF feature types (%d): %v", i, err))
		}
		if i == 0 {
			// skip header
			i++
			continue
		}
		if len(record) != columns {
			panic(fmt.Sprintf("invalid URF feature types (%d): %v", i, record))
		}

		depth, _ := strconv.Atoi(record[2])

		if depth < lastDepth {
			parents = parents[:len(parents)-1]
		} else if depth > lastDepth {
			parents = append(parents, lastCode)
		}
		parent := ""
		if len(parents) > 0 {
			parent = parents[len(parents)-1]
		}

		UrfFeatureTypes = append(UrfFeatureTypes, record[1])
		UrfFeatureTypeMap[record[1]] = UrfType{
			Name:       record[0],
			Code:       record[1],
			Depth:      depth,
			ParentCode: parent,
		}

		lastDepth = depth
		lastCode = record[1]
		i++
	}
}
