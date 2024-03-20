package preparegspatialjp

import (
	"fmt"
	"strings"

	"github.com/dustin/go-humanize"
)

const ortho = "オルソ"

var itemsForOrtho = []*IndexItem{
	{Name: "**metadata** (PDF)"},
	{Name: "**images** (GeoTIFF)"},
}

func generateGenericdIndexItems(data []GspatialjpIndexItemGroup) (res []*IndexItem, err error) {
	for _, d := range data {
		u := d.AssetURL()
		if u == "" {
			continue
		}
		if d.Type == "" {
			d.Type = "ユースケースデータ"
		}

		size, err := httpSize(u)
		if err != nil {
			return nil, fmt.Errorf("%s からファイルをダウンロードできませんでした。: %w", u, err)
		}

		var children []*IndexItem
		if strings.Contains(d.Type, ortho) {
			children = itemsForOrtho
		} else {
			children = []*IndexItem{
				{
					Name: d.Name,
				},
			}
		}

		res = append(res, &IndexItem{
			Name: fmt.Sprintf(
				"**%s**：%s (%s)",
				fileNameFromURL(u),
				d.Type,
				humanize.Bytes(size),
			),
			Children: children,
		})
	}
	return
}
