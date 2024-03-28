package govpolygon

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestQuadtree(t *testing.T) {
	p := NewProcessor(filepath.Join(dirpath, "japan_city.geojson"))
	ctx := context.Background()
	f, _, err := p.ComputeGeoJSON(ctx, nil)
	assert.NoError(t, err)

	q := NewQuadtree(f.Features)
	res, ok := q.Find(139.760296, 35.686067)
	assert.True(t, ok)
	assert.Equal(t, "13101", res)

	res, ok = q.Find(19.760296, 35.686067)
	assert.False(t, ok)
	assert.Empty(t, res)
}

func BenchmarkQuadtree(b *testing.B) {
	p := NewProcessor(filepath.Join(dirpath, "japan_city.geojson"))
	ctx := context.Background()
	f, _, _ := p.ComputeGeoJSON(ctx, nil)
	q := NewQuadtree(f.Features)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = q.Find(139.760296, 35.686067)
	}
}
