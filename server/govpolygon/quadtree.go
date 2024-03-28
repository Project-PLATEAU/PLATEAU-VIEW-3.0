package govpolygon

import (
	"github.com/JamesLMilner/quadtree-go"
	geojson "github.com/paulmach/go.geojson"
)

type Quadtree struct {
	qt *quadtree.Quadtree
	ft map[quadtree.Bounds]*geojson.Feature
}

func NewQuadtree(f []*geojson.Feature) *Quadtree {
	ft := map[quadtree.Bounds]*geojson.Feature{}
	qt := &quadtree.Quadtree{
		MaxObjects: 10,
		MaxLevels:  100,
		Objects:    make([]quadtree.Bounds, 0),
		Nodes:      make([]quadtree.Quadtree, 0),
	}

	for _, f := range f {
		b, ok := bounds(f.Geometry)
		if !ok {
			continue
		}

		qt.Insert(b)
		ft[b] = f
	}

	return &Quadtree{
		qt: qt,
		ft: ft,
	}
}

func (q *Quadtree) Find(lng, lat float64) (string, bool) {
	res := q.qt.RetrieveIntersections(quadtree.Bounds{
		X: lng,
		Y: lat,
	})
	if len(res) == 0 {
		return "", false
	}

	for _, f := range res {
		f2 := q.ft[f]
		if isPointInPolygonFeature(lng, lat, f2) {
			code, _ := f2.Properties["code"].(string)
			if code != "" {
				return code, true
			}
		}
	}

	return "", false
}

func bounds(g *geojson.Geometry) (b quadtree.Bounds, _ bool) {
	if !g.IsMultiPolygon() && !g.IsPolygon() {
		return
	}

	if g.IsPolygon() {
		g = &geojson.Geometry{
			Type:         "MultiPolygon",
			MultiPolygon: [][][][]float64{g.Polygon},
		}
	}

	minlat := -1.0
	minlng := -1.0
	maxlat := -1.0
	maxlng := -1.0

	for _, polygon := range g.MultiPolygon {
		for _, ring := range polygon {
			for _, p := range ring {
				lng := p[0]
				lat := p[1]

				if minlat == -1 || lat < minlat {
					minlat = lat
				}
				if minlng == -1 || lng < minlng {
					minlng = lng
				}

				if maxlat == -1 || lat > maxlat {
					maxlat = lat
				}
				if maxlng == -1 || lng > maxlng {
					maxlng = lng
				}
			}
		}
	}

	return quadtree.Bounds{
		X:      minlng,
		Y:      minlat,
		Width:  maxlng - minlng,
		Height: maxlat - minlat,
	}, true
}

func isPointInPolygonFeature(lng, lat float64, f *geojson.Feature) bool {
	if !f.Geometry.IsMultiPolygon() && !f.Geometry.IsPolygon() {
		return false
	}

	if f.Geometry.IsPolygon() {
		f.Geometry = &geojson.Geometry{
			Type:         "MultiPolygon",
			MultiPolygon: [][][][]float64{f.Geometry.Polygon},
		}
	}

	for _, polygon := range f.Geometry.MultiPolygon {
		if len(polygon) == 0 {
			continue
		}
		if isPointInPolygon(lng, lat, polygon[0]) {
			return true
		}
	}

	return false
}

func isPointInPolygon(lng, lat float64, polygon [][]float64) bool {
	var count int
	plen := len(polygon)
	for i := 0; i < plen; i++ {
		j := (i + 1) % plen
		if ((polygon[i][1] > lat) != (polygon[j][1] > lat)) &&
			(lng < (polygon[j][0]-polygon[i][0])*(lat-polygon[i][1])/(polygon[j][1]-polygon[i][1])+polygon[i][0]) {
			count++
		}
	}
	return count%2 != 0
}
