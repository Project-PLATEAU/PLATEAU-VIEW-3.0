package preparegspatialjp

import (
	"fmt"
	"io/fs"
	"path"
	"strings"

	"github.com/dustin/go-humanize"
)

func generateCityGMLIndexItem(seed *IndexSeed, name string, size uint64, f fs.FS) (*IndexItem, error) {
	ft := ""

	return walk(f, "", "/", func(p string, d fs.DirEntry, err error) (*IndexItem, error) {
		if p == "" {
			return &IndexItem{
				Name: fmt.Sprintf("**%s**：CityGML（v%d）(%s)", name, seed.V, humanize.Bytes(size)),
			}, nil
		}

		base := path.Base(p)

		if name, ok := featureTypees[base]; ok {
			ft = base
			return &IndexItem{
				Name: fmt.Sprintf("**%s**：%s（CityGML）", base, name),
			}, nil
		}

		if ft != "" && seed.Dic != nil {
			if dic := seed.Dic[ft]; dic != nil {
				if name, ok := dic[base]; ok {
					return &IndexItem{
						Name: fmt.Sprintf("**%s**：%s", base, name),
					}, nil
				}
			}
		}

		if strings.HasSuffix(base, indexmap) {
			ft = ""
			return &IndexItem{
				Name: fmt.Sprintf("**%s**：索引図（PDF）", base),
			}, nil
		}

		if name, ok := citygmlDic[base]; ok {
			return &IndexItem{
				Name: fmt.Sprintf("**%s**：%s", base, name),
			}, nil
		}

		if p == udx {
			ft = ""
			return &IndexItem{
				Name: fmt.Sprintf("**%s**", base),
			}, nil
		}

		return nil, nil
	})
}
