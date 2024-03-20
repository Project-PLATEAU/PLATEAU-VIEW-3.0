package datacatalogv3

import (
	"fmt"
	"net/url"
	"path"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/samber/lo"
)

func riverAdminFrom(admin string) *plateauapi.RiverAdmin {
	switch admin {
	case "国":
		fallthrough
	case "natl":
		return lo.ToPtr(plateauapi.RiverAdminNational)
	case "都道府県":
		fallthrough
	case "pref":
		return lo.ToPtr(plateauapi.RiverAdminPrefecture)
	}
	return nil
}

func toRiverAdminName(a plateauapi.RiverAdmin) string {
	switch a {
	case plateauapi.RiverAdminNational:
		return "国"
	case plateauapi.RiverAdminPrefecture:
		return "都道府県"
	}
	return ""
}

func textureFrom(notexture *bool) *plateauapi.Texture {
	if notexture == nil {
		return nil
	}
	if *notexture {
		return lo.ToPtr(plateauapi.TextureNone)
	}
	return lo.ToPtr(plateauapi.TextureTexture)
}

func datasetFormatFromOrDetect(f string, url string) plateauapi.DatasetFormat {
	if f != "" {
		return datasetFormatFrom(f)
	}
	return detectDatasetFormatFromURL(url)
}

func datasetFormatFrom(f string) plateauapi.DatasetFormat {
	switch strings.ToLower(f) {
	case "geojson":
		return plateauapi.DatasetFormatGeojson
	case "3dtiles":
		fallthrough
	case "3d tiles":
		return plateauapi.DatasetFormatCesium3dtiles
	case "czml":
		return plateauapi.DatasetFormatCzml
	case "gtfs":
		fallthrough
	case "gtfs-realtime":
		return plateauapi.DatasetFormatGtfsRealtime
	case "gltf":
		return plateauapi.DatasetFormatGltf
	case "mvt":
		return plateauapi.DatasetFormatMvt
	case "tiles":
		return plateauapi.DatasetFormatTiles
	case "tms":
		return plateauapi.DatasetFormatTms
	case "wms":
		return plateauapi.DatasetFormatWms
	case "csv":
		return plateauapi.DatasetFormatCSV
	}
	return ""
}

func detectDatasetFormatFromURL(url string) plateauapi.DatasetFormat {
	name := strings.ToLower(nameFromURL(url))

	switch {
	case strings.HasSuffix(name, ".geojson"):
		return plateauapi.DatasetFormatGeojson
	case strings.HasSuffix(name, ".czml"):
		return plateauapi.DatasetFormatCzml
	case strings.HasSuffix(name, "{z}/{x}/{y}.pbf"):
		fallthrough
	case strings.HasSuffix(name, ".mvt"):
		return plateauapi.DatasetFormatMvt
	case name == "tileset.json":
		return plateauapi.DatasetFormatCesium3dtiles
	case strings.HasSuffix(name, ".csv"):
		return plateauapi.DatasetFormatCSV
	case strings.HasSuffix(name, ".gltf"):
		return plateauapi.DatasetFormatGltf
	case strings.HasSuffix(name, "{z}/{x}/{y}.png"):
		return plateauapi.DatasetFormatTiles
	}

	return ""
}

func standardItemID(name string, areaCode plateauapi.AreaCode, ex string) string {
	if ex != "" {
		ex = fmt.Sprintf("_%s", ex)
	}
	return fmt.Sprintf("%s_%s%s", areaCode, name, ex)
}

func standardItemName(name, subname, areaName string) string {
	var suffix string
	if areaName != "" {
		suffix = fmt.Sprintf("（%s）", areaName)
		name = strings.TrimSuffix(name, suffix)
	}

	space := ""
	if subname != "" {
		space = " "
	}

	return fmt.Sprintf("%s%s%s%s", name, space, subname, suffix)
}

func layerNamesFrom(layer string) []string {
	if layer == "" {
		return nil
	}

	return lo.Map(strings.Split(layer, ","), func(s string, _ int) string {
		return strings.TrimSpace(s)
	})
}

func newAdmin(id string, stage stage, cmsurl string, extra any) any {
	a := map[string]any{}

	if cmsurl != "" && id != "" {
		a["cmsUrl"] = cmsurl + id
	}

	if stage != stageGA {
		if stage == "" {
			stage = stageAlpha
		}
		a["stage"] = string(stage)
	}

	if extra, ok := extra.(map[string]any); ok && extra != nil {
		for k, v := range extra {
			a[k] = v
		}
	}

	if len(a) == 0 {
		return nil
	}

	return a
}

func assetURLFromFormat(u string, f plateauapi.DatasetFormat) string {
	if u == "" {
		return ""
	}

	u2, err := url.Parse(u)
	if err != nil {
		return u
	}

	dir := path.Dir(u2.Path)
	ext := path.Ext(u2.Path)
	base := path.Base(u2.Path)
	name := strings.TrimSuffix(base, ext)
	isArchive := ext == ".zip" || ext == ".7z"

	u2.Path = assetRootPath(u2.Path)
	if f == plateauapi.DatasetFormatCesium3dtiles {
		if !isArchive {
			// not CMS asset
			return u
		}

		u2.Path = path.Join(u2.Path, "tileset.json")
		return u2.String()
	} else if f == plateauapi.DatasetFormatTiles || f == plateauapi.DatasetFormatMvt {
		us := ""
		if !isArchive {
			// not CMS asset
			us = u
		} else {
			ext := ""
			if f == plateauapi.DatasetFormatMvt {
				ext = "mvt"
			} else {
				ext = "png"
			}

			u2.Path = path.Join(u2.Path, "{z}/{x}/{y}."+ext)
			us = u2.String()
		}

		return strings.ReplaceAll(strings.ReplaceAll(us, "%7B", "{"), "%7D", "}")
	} else if f == plateauapi.DatasetFormatTms {
		if !isArchive {
			// not CMS asset
			return u
		}
		return u2.String()
	} else if (f == plateauapi.DatasetFormatCzml) && isArchive {
		u2.Path = path.Join(dir, name, fmt.Sprintf("%s.%s", name, strings.ToLower(string(f))))
		return u2.String()
	}
	return u
}

func assetRootPath(p string) string {
	fn := strings.TrimSuffix(path.Base(p), path.Ext(p))
	return path.Join(path.Dir(p), fn)
}

func sampleAdmin(sample bool) any {
	if sample {
		return map[string]any{"sample": true}
	}
	return nil
}

func isSampleAdmin(admin any) bool {
	m, _ := admin.(map[string]any)
	if m == nil {
		return false
	}

	_, ok := m["sample"]
	return ok
}

func movePlateauSampleDataToGeneric(d plateauapi.Datasets, t *plateauapi.GenericDatasetType) {
	if t == nil {
		return
	}

	plateau := d[plateauapi.DatasetTypeCategoryPlateau]
	generic := d[plateauapi.DatasetTypeCategoryGeneric]

	for i, p := range plateau {
		pd, ok := p.(*plateauapi.PlateauDataset)
		if !ok || !isSampleAdmin(p.GetAdmin()) {
			continue
		}

		newID := pd.ID + "_sample"
		tid := t.ID
		tcode := t.Code
		gd := plateauapi.PlateauDatasetToGenericDataset(pd, tid, tcode, newID)
		gd.Admin.(map[string]any)["plateauTypeId"] = pd.TypeID
		gd.Admin.(map[string]any)["plateauTypeCode"] = pd.TypeCode

		generic = append(generic, gd)
		plateau = append(plateau[:i], plateau[i+1:]...)
	}

	d[plateauapi.DatasetTypeCategoryPlateau] = plateau
	d[plateauapi.DatasetTypeCategoryGeneric] = generic
}
