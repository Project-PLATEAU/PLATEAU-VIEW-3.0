package govpolygon

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestProcessor(t *testing.T) {
	p := &Processor{
		path: "govpolygondata/japan_city.geojson",
	}
	names := [][]string{
		{"北海道"},
		{"北海道/札幌市"},
		{"東京都/千代田区"},
		{"北海道/札幌市"},
		{"大阪府/大阪市"},
	}
	write := false

	for i, n := range names {
		n := n
		t.Run(fmt.Sprintf("%v", n), func(t *testing.T) {
			ctx := context.Background()
			geojson, notfound, err := p.ComputeGeoJSON(ctx, n)
			assert.NoError(t, err)
			assert.Empty(t, notfound)
			assert.NotEmpty(t, geojson.Features)

			if write {
				j, _ := json.MarshalIndent(geojson, "", "  ")
				_ = os.WriteFile(fmt.Sprintf("%d.geojson", i), j, 0644)
			}
		})
	}
}
