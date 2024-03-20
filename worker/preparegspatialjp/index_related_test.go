package preparegspatialjp

import (
	"testing"

	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestGenerateRelatedIndexItem(t *testing.T) {
	f := afero.NewMemMapFs()
	lo.Must(f.Create("xxx_border.geojson")).Close()
	lo.Must(f.Create("xxx_shelter.geojson")).Close()
	lo.Must(f.Create("xxx_landmark_.geojson")).Close()
	lo.Must(f.Create("xxx_emergency_route_.geojson")).Close()
	lo.Must(f.Create("xxx_station.geojson")).Close()
	lo.Must(f.Create("xxx_station_2.geojson")).Close()
	lo.Must(f.Create("xxx_park.geojson")).Close()
	lo.Must(f.Create("xxx_railway.geojson")).Close()
	ff := afero.NewIOFS(f)

	seed := &IndexSeed{V: 1}
	name := "test"
	size := uint64(123456789)
	res, err := generateRelatedIndexItem(seed, name, size, ff)
	assert.NoError(t, err)

	expected := &IndexItem{
		Name: "**test**：関連データセット（v1）(124 MB)",
		Children: []*IndexItem{
			{Name: "**shelter**：避難施設情報（GeoJSON）"},
			{Name: "**landmark**：ランドマーク情報（GeoJSON）"},
			{Name: "**station**：鉄道駅情報（GeoJSON）"},
			{Name: "**park**：公園情報（GeoJSON）"},
			{Name: "**railway**：鉄道情報（GeoJSON）"},
			{Name: "**emergency_route**：緊急輸送道路情報（GeoJSON）"},
			{Name: "**border**：行政界情報（GeoJSON）"},
		},
	}

	assert.Equal(t, expected, res)
}
