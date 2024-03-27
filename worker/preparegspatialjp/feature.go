package preparegspatialjp

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	cms "github.com/reearth/reearth-cms-api/go"
)

type FeatureItem struct {
	ID      string   `json:"id,omitempty"`
	CityGML string   `json:"citygml,omitempty"`
	Data    []string `json:"data,omitempty"`
	MaxLOD  string   `json:"maxlod,omitempty"`
	Dic     string   `json:"dic,omitempty"`
}

func getAllFeatureItems(ctx context.Context, c *cms.CMS, cityItem *CityItem) (map[string]FeatureItem, error) {
	items := map[string]FeatureItem{}

	for key, ref := range cityItem.References {
		if ref == "" {
			continue
		}
		item, err := c.GetItem(ctx, ref, true)
		if err != nil {
			return nil, fmt.Errorf("failed to get item: %w", err)
		}

		if fi, ok := FeatureItemFrom(item); ok {
			items[key] = fi
		}
	}

	return items, nil
}

func FeatureItemFrom(item *cms.Item) (res FeatureItem, ok bool) {
	type internalGroup struct {
		Data []any `cms:"data"`
	}

	type internalItem struct {
		ID      string          `cms:"id"`
		CityGML any             `cms:"citygml"`
		Data    []any           `cms:"data"`
		Items   []internalGroup `cms:"items,group"`
		MaxLOD  any             `cms:"maxlod"`
		Dic     string          `cms:"dic"`
		Sample  bool            `cms:"sample,bool,metadata"`
		Skip    bool            `cms:"skip_geospatialjp,bool,metadata"`
	}

	fi := internalItem{}
	item.Unmarshal(&fi)

	if fi.Sample || fi.Skip {
		return
	}

	res.ID = fi.ID
	res.Dic = fi.Dic

	if fi.CityGML != nil {
		asset, ok := fi.CityGML.(map[string]any)
		if ok {
			url, _ := asset["url"].(string)
			res.CityGML = url
		}
	}

	if fi.MaxLOD != nil {
		asset, ok := fi.MaxLOD.(map[string]any)
		if ok {
			url, _ := asset["url"].(string)
			res.MaxLOD = url
		}
	}

	if fi.Data != nil {
		for _, d := range fi.Data {
			asset, ok := d.(map[string]any)
			if ok {
				url, _ := asset["url"].(string)
				res.Data = append(res.Data, url)
			}
		}
	}

	if fi.Items != nil {
		for _, item := range fi.Items {
			for _, d := range item.Data {
				asset, ok := d.(map[string]any)
				if ok {
					url, _ := asset["url"].(string)
					res.Data = append(res.Data, url)
				}
			}
		}
	}

	ok = true
	return
}

func mergeDics(dics map[string]FeatureItem) (res map[string]map[string]string) {
	type dicEntry struct {
		Name        *StringOrNumber `json:"name"`
		Code        *StringOrNumber `json:"code"`
		Description string          `json:"description"`
	}

	res = map[string]map[string]string{}
	for ft, f := range dics {
		dic := f.Dic
		if dic == "" {
			continue
		}

		var data map[string][]dicEntry
		if err := json.Unmarshal([]byte(dic), &data); err != nil {
			continue
		}

		for _, v := range data {
			for _, e := range v {
				if e.Description == "" {
					continue
				}

				key := e.Name.String()
				if key == "" {
					key = e.Code.String()
				}
				if key == "" {
					continue
				}

				desc := e.Description
				if ft == "fld" {
					key = strings.TrimSuffix(key, "_l1")
					key = strings.TrimSuffix(key, "_l2")
					desc += "洪水浸水想定区域"
				}

				if res[ft] == nil {
					res[ft] = map[string]string{}
				}

				res[ft][key] = desc
			}
		}
	}

	return
}
