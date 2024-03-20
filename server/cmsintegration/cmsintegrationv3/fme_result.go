package cmsintegrationv3

import (
	"fmt"
	"regexp"
	"sort"
	"strings"

	"golang.org/x/exp/maps"
	"golang.org/x/exp/slices"
)

const fmeIDPrefix = "v3"

type fmeID struct {
	ItemID      string
	ProjectID   string
	FeatureType string
	Type        string
}

func parseFMEID(id, secret string) (fmeID, error) {
	payload, err := unsignFMEID(id, secret)
	if err != nil {
		return fmeID{}, err
	}

	s := strings.SplitN(payload, ";", 5)
	if len(s) != 5 || s[0] != fmeIDPrefix {
		return fmeID{}, ErrInvalidFMEID
	}

	return fmeID{
		ItemID:      s[1],
		ProjectID:   s[2],
		FeatureType: s[3],
		Type:        s[4],
	}, nil
}

func (i fmeID) String(secret string) string {
	payload := fmt.Sprintf("%s;%s;%s;%s;%s", fmeIDPrefix, i.ItemID, i.ProjectID, i.FeatureType, i.Type)
	return signFMEID(payload, secret)
}

type fmeResult struct {
	Type    string         `json:"type"`
	Status  string         `json:"status"`
	ID      string         `json:"id"`
	Message string         `json:"message"`
	LogURL  string         `json:"logUrl"`
	Results map[string]any `json:"results"`
}

func (f fmeResult) ParseID(secret string) fmeID {
	id, err := parseFMEID(f.ID, secret)
	if err != nil {
		return fmeID{}
	}
	return id
}

type fmeResultURLs struct {
	FeatureType string
	Keys        []string
	Data        []string
	DataMap     map[string][]string
	Dic         string
	MaxLOD      string
	QCResult    string
}

var reDigits = regexp.MustCompile(`^\d+_(.*)$`)

func (f fmeResult) GetResultURLs(featureType string) (res fmeResultURLs) {
	res.FeatureType = featureType
	res.DataMap = map[string][]string{}

	keys := maps.Keys(f.Results)
	sort.Strings(keys)

	for _, k := range keys {
		v := f.Results[k]
		k2 := reDigits.ReplaceAllString(k, "$1")
		k2 = strings.TrimSuffix(k2, "_no_texture")
		k2 = strings.TrimSuffix(k2, "_l1")
		k2 = strings.TrimSuffix(k2, "_l2")
		k2 = strings.TrimSuffix(k2, "_lod0")
		k2 = strings.TrimSuffix(k2, "_lod1")
		k2 = strings.TrimSuffix(k2, "_lod2")
		k2 = strings.TrimSuffix(k2, "_lod3")
		k2 = strings.TrimSuffix(k2, "_lod4")

		if k2 == featureType || strings.HasPrefix(k2, featureType+"/") || strings.HasPrefix(k2, featureType+"_") {
			if v2, ok := v.(string); ok {
				if !slices.Contains(res.Keys, k2) {
					res.Keys = append(res.Keys, k2)
				}
				res.Data = append(res.Data, v2)
				res.DataMap[k2] = append(res.DataMap[k2], v2)
			} else if v2, ok := v.([]any); ok {
				for _, v3 := range v2 {
					if v4, ok := v3.(string); ok {
						if !slices.Contains(res.Keys, k2) {
							res.Keys = append(res.Keys, k2)
						}
						res.Data = append(res.Data, v4)
						res.DataMap[k2] = append(res.DataMap[k2], v4)
					}
				}
			} else if v2, ok := v.([]string); ok {
				for _, v3 := range v2 {
					if !slices.Contains(res.Keys, k2) {
						res.Keys = append(res.Keys, k2)
					}
					res.Data = append(res.Data, v3)
					res.DataMap[k2] = append(res.DataMap[k2], v3)
				}
			}
		}
	}

	if v, ok := f.Results["_dic"].(string); ok {
		res.Dic = v
	}

	if v, ok := f.Results["_maxlod"].(string); ok {
		res.MaxLOD = v
	}

	if v, ok := f.Results["_qc_result"].(string); ok {
		res.QCResult = v
	}

	return
}
