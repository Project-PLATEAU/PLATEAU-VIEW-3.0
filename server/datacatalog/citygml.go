package datacatalog

import (
	"context"
	"fmt"
	"net/url"
	"path"
	"slices"
	"strconv"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type CityGMLFilesResponse struct {
	CityCode         string       `json:"cityCode"`
	CityName         string       `json:"cityName"`
	Year             int          `json:"year"`
	RegistrationYear int          `json:"registrationYear"`
	Spec             string       `json:"spec"`
	URL              string       `json:"url"`
	Files            CityGMLFiles `json:"files"`
}

type CityGMLFiles = map[string][]CityGMLFile

type CityGMLFile struct {
	MeshCode string `json:"code"`
	MaxLOD   int    `json:"maxLod"`
	URL      string `json:"url"`
}

func fetchCityGMLFiles(ctx context.Context, r plateauapi.Repo, id string) (*CityGMLFilesResponse, error) {
	n, err := r.Node(ctx, plateauapi.CityGMLDatasetIDFrom(plateauapi.AreaCode(id)))
	if err != nil {
		return nil, err
	}

	citygml, ok := n.(*plateauapi.CityGMLDataset)
	if !ok || citygml == nil || citygml.URL == "" || citygml.PlateauSpecMinorID == "" {
		return nil, nil
	}

	n, err = r.Node(ctx, citygml.PlateauSpecMinorID)
	if err != nil {
		return nil, err
	}

	spec, ok := n.(*plateauapi.PlateauSpecMinor)
	if !ok || spec == nil {
		return nil, nil
	}

	n, err = r.Node(ctx, citygml.CityID)
	if err != nil {
		return nil, err
	}

	city, ok := n.(*plateauapi.City)
	if !ok || city == nil {
		return nil, nil
	}

	admin, ok := citygml.Admin.(map[string]any)
	if !ok || admin == nil {
		return nil, nil
	}

	maxlodURLs, ok := admin["maxlod"].([]string)
	if !ok {
		return nil, nil
	}

	citygmlURLs, ok := admin["citygmlUrl"].([]string)
	if !ok {
		return nil, nil
	}

	var gurls []*url.URL
	citygmlAssetID, _ := admin["citygmlAssetId"].(string)
	if citygmlAssetID != "" {
		mds := plateaucms.GetAllCMSMetadataFromContext(ctx)
		md := mds.FindByYear(citygml.RegistrationYear)
		if md == nil {
			return nil, fmt.Errorf("failed to find cms")
		}

		cms, err := md.CMS()
		if err != nil || cms == nil {
			return nil, fmt.Errorf("failed to init cms: %w", err)
		}

		asset, err := cms.Asset(ctx, citygmlAssetID)
		if err != nil {
			return nil, fmt.Errorf("failed to get asset: %w", err)
		}

		assetBase, err := url.Parse(asset.URL)
		if err != nil {
			return nil, fmt.Errorf("failed to parse asset url: %w", err)
		}

		assetBase.Path = path.Dir(assetBase.Path)
		gurls = gmlURLs(asset.File.Paths(), assetBase)
	}

	data, err := fetchCSVs(ctx, maxlodURLs, citygmlURLs)
	if err != nil {
		return nil, err
	}

	files := csvToCityGMLFilesResponse(data, gurls)
	return &CityGMLFilesResponse{
		CityCode:         string(citygml.CityCode),
		CityName:         city.Name,
		Year:             citygml.Year,
		RegistrationYear: citygml.RegistrationYear,
		Spec:             spec.Version,
		URL:              citygml.URL,
		Files:            files,
	}, nil
}

func csvToCityGMLFilesResponse(data [][]string, gmlURLs []*url.URL) CityGMLFiles {
	res := make(CityGMLFiles)

	for _, record := range data {
		if len(record) < 3 || record[0] == "" || record[1] == "" {
			continue
		}

		if !isNumeric(rune(record[1][0])) {
			continue // skip header
		}

		// base,code,type,maxLod(,path)
		base := record[0]
		meshCode := record[1]
		featureType := record[2]
		maxlod, _ := strconv.Atoi(record[3])
		citygmlURL := ""
		gmlPath := record[4]

		if len(record) > 4 && gmlURLs == nil {
			citygmlURL = citygmlItemURLFrom(base, gmlPath, featureType)
		} else {
			// compat for datacatalogv2
			prefix := fmt.Sprintf("%s_%s_", meshCode, featureType)

			u, ok := lo.Find(gmlURLs, func(u *url.URL) bool {
				return strings.HasPrefix(path.Base(u.Path), prefix) && path.Ext(u.Path) == ".gml"
			})
			if ok {
				citygmlURL = u.String()
			}
			// warning = append(warning, fmt.Sprintf("unmatched:type=%s,code=%s,path=%s", ty, code, f))
		}

		if citygmlURL == "" {
			continue
		}

		item := CityGMLFile{
			MeshCode: meshCode,
			MaxLOD:   maxlod,
			URL:      citygmlURL,
		}

		if _, ok := res[featureType]; !ok {
			res[featureType] = make([]CityGMLFile, 0)
		}

		res[featureType] = append(res[featureType], item)
	}

	for _, v := range res {
		slices.SortFunc(v, func(i, j CityGMLFile) int {
			return strings.Compare(i.MeshCode, j.MeshCode)
		})
	}

	return res
}

func citygmlItemURLFrom(base, p, typeCode string) string {
	b := path.Base(base)
	base = strings.TrimSuffix(base, b)
	u, _ := url.JoinPath(base, nameWithoutExt(b), "udx", typeCode, p)
	return u
}

func gmlURLs(paths []string, base *url.URL) []*url.URL {
	res := lo.FilterMap(paths, func(u string, _ int) (*url.URL, bool) {
		if path.Ext(u) != ".gml" {
			return nil, false
		}

		u2, err := url.Parse(u)
		if err != nil {
			return nil, false
		}

		if base == nil {
			return u2, true
		}

		fu := util.CloneRef(base)
		fu.Path = path.Join(fu.Path, u)
		return fu, true
	})

	return res
}

func isNumeric(r rune) bool {
	return r >= '0' && r <= '9'
}

func nameWithoutExt(name string) string {
	return strings.TrimSuffix(name, path.Ext(name))
}
