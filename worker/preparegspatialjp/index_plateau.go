package preparegspatialjp

import (
	"fmt"
	"io/fs"
	"path"
	"slices"
	"sort"
	"strings"

	"github.com/dustin/go-humanize"
	"golang.org/x/exp/maps"
)

func generatePlateauIndexItem(seed *IndexSeed, name string, size uint64, f fs.FS) (*IndexItem, error) {
	data := map[string]plateauItemSeed{}

	if err := fs.WalkDir(f, "", func(p string, d fs.DirEntry, err error) error {
		base := path.Base(p)
		_, name, _ := strings.Cut(base, "_op_")
		if name == "" {
			return nil
		}

		featureType := extractFeatureType(base)
		if featureType == "" {
			return nil
		}

		lod := extractLOD(base)

		if _, ok := data[featureType]; !ok {
			data[featureType] = plateauItemSeed{
				Type: featureType,
				Name: name,
				LOD:  nil,
			}
		}
		if lod > -1 {
			d := data[featureType]
			if d.LOD == nil {
				d.LOD = map[int]string{}
			}
			d.LOD[lod] = name
			data[featureType] = d
		}
		return nil
	}); err != nil {
		return nil, fmt.Errorf("failed to walk plateau zip: %w", err)
	}

	items := plateauItems(data)
	children := []*IndexItem{}
	for _, d := range items {
		children = append(children, d.Item())
	}

	return &IndexItem{
		Name:     fmt.Sprintf("**%s**：3D Tiles, MVT（v%d）(%s)", name, seed.V, humanize.Bytes(size)),
		Children: children,
	}, nil
}

func extractFeatureType(name string) string {
	for _, f := range featureTypes {
		if strings.Contains("_"+name+"_", f) {
			return f
		}
	}

	return ""
}

func extractDataFormat(name string) string {
	if strings.Contains(name, "_3dtiles") {
		return "3D Tiles"
	}
	if strings.Contains(name, "_mvt") {
		return "MVT"
	}
	return ""
}

var lod = []int{0, 1, 2, 3, 4}

func extractLOD(name string) int {
	for _, l := range lod {
		if strings.Contains(name, fmt.Sprintf("_lod%d", l)) {
			return l
		}
	}
	return -1
}

type plateauItemSeed struct {
	Type string
	Name string
	LOD  map[int]string
}

func (p plateauItemSeed) Item() *IndexItem {
	title := featureTypees[p.Type]
	format := extractDataFormat(p.Name)

	if len(p.LOD) == 0 {
		return &IndexItem{
			Name: fmt.Sprintf("**%s**：%s（%s）", p.Type, title, format),
		}
	}
	if len(p.LOD) == 1 {
		firstKey := maps.Keys(p.LOD)[0]
		name := p.LOD[firstKey]
		format := extractDataFormat(name)
		return &IndexItem{
			Name: fmt.Sprintf("**%s**：%s（LOD%d, %s）", p.Type, title, firstKey, format),
		}
	}

	lods := maps.Keys(p.LOD)
	sort.Ints(lods)
	children := make([]*IndexItem, 0, len(lods))
	for _, lod := range lods {
		name := p.LOD[lod]
		format := extractDataFormat(name)
		children = append(children, &IndexItem{
			Name: fmt.Sprintf("%s（LOD%d, %s）", title, lod, format),
		})
	}

	return &IndexItem{
		Name:     fmt.Sprintf("**%s**：%s", p.Type, title),
		Children: children,
	}
}

func plateauItems(m map[string]plateauItemSeed) []plateauItemSeed {
	items := make([]plateauItemSeed, 0, len(m))
	for _, v := range m {
		items = append(items, v)
	}

	// sort by key. follow fratureTypes order
	sort.Slice(items, func(i, j int) bool {
		index1 := slices.Index(featureTypes, items[i].Type)
		index2 := slices.Index(featureTypes, items[j].Type)
		return index1 < index2
	})

	return items
}
