package datacatalogv2adapter

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2/datacatalogutil"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

const hideTokyo23ku = false

const usecaseID = "usecase"
const globalID = "global"
const registrationYear = 2022
const tokyoCode = "13"
const tokyo23kuCode = "13100"

var floodingTypes = []string{"fld", "htd", "tnm", "ifld"}

var landmarkTypes = map[string]string{
	"病院":      "hospital",
	"消防署":     "fire_station",
	"警察署":     "police_station",
	"郵便局":     "post_office",
	"保健所":     "health_center",
	"国の機関":    "national_agency",
	"地方の機関":   "local_agency",
	"指定公共機関":  "designated_public_institution",
	"博物館・美術館": "museum",
	"学校":      "school",
	"ランドマーク":  "landmark",
}

var types = []string{
	"bldg",
	"tran",
	"brid",
	"rail",
	"veg",
	"frn",
	"luse",
	"lsld",
	"urf",
	"fld",
	"tnm",
	"htd",
	"ifld",
	"gen",
}

var plateauSpecs = []plateauapi.PlateauSpec{
	{
		ID:           plateauSpecIDFrom("2"),
		MajorVersion: 2,
		Year:         2022,
		MinorVersions: []*plateauapi.PlateauSpecMinor{
			{
				ID:           plateauSpecIDFrom("2.3"),
				Version:      "2.3",
				Name:         "第2.3版",
				MajorVersion: 2,
				Year:         2022,
				ParentID:     plateauSpecIDFrom("2"),
			},
		},
	},
	{
		ID:           plateauSpecIDFrom("3"),
		MajorVersion: 3,
		Year:         2022,
		MinorVersions: []*plateauapi.PlateauSpecMinor{
			{
				ID:           plateauSpecIDFrom("3.0"),
				Version:      "3.0",
				Name:         "第3.0版",
				MajorVersion: 3,
				Year:         2023,
				ParentID:     plateauSpecIDFrom("3"),
			},
		},
	},
}

func plateauDatasetFrom(d datacatalogv2.DataCatalogItem) *plateauapi.PlateauDataset {
	if d.Family != "plateau" {
		return nil
	}

	plateauSpecVersion := d.Spec
	if isEx(d) {
		plateauSpecVersion = "3.0"
	}

	var river *plateauapi.River
	if slices.Contains(floodingTypes, d.TypeEn) {
		if d.TypeEn == "fld" {
			var admin plateauapi.RiverAdmin
			if strings.Contains(d.Name, "（国管理区間）") {
				admin = plateauapi.RiverAdminNational
			} else if strings.Contains(d.Name, "（都道府県管理区間）") {
				admin = plateauapi.RiverAdminPrefecture
			}

			names := strings.Split(reBrackets.ReplaceAllString(d.Name, ""), " ")
			name, _ := lo.Find(names, func(s string) bool {
				return strings.HasSuffix(s, "川")
			})

			river = &plateauapi.River{
				Name:  name,
				Admin: admin,
			}
		}
	}

	name := d.Name
	if !strings.Contains(name, d.Type) {
		name = fmt.Sprintf("%s %s", d.Type, name)
	}

	id := datasetIDFrom(d)
	return &plateauapi.PlateauDataset{
		ID:                 id,
		Name:               name,
		Subname:            lo.EmptyableToPtr(getSubName(d)),
		Subcode:            lo.EmptyableToPtr(getSubCode(d)),
		Suborder:           nil,
		OpenDataURL:        lo.EmptyableToPtr(d.OpenDataURL),
		Description:        lo.ToPtr(d.Description),
		PrefectureID:       prefectureIDFrom(d),
		PrefectureCode:     prefectureCodeFrom(d),
		CityID:             cityIDFrom(d, false),
		CityCode:           cityCodeFrom(d, false),
		WardID:             wardIDFrom(d, false),
		WardCode:           wardCodeFrom(d, false),
		Year:               d.Year,
		RegisterationYear:  registrationYear,
		TypeID:             datasetTypeIDFrom(d),
		TypeCode:           datasetTypeCodeFrom(d),
		Groups:             groupsFrom(d),
		PlateauSpecMinorID: plateauSpecIDFrom(plateauSpecVersion),
		River:              river,
		Items: lo.Map(d.MainOrConfigItems(), func(c datacatalogutil.DataCatalogItemConfigItem, i int) *plateauapi.PlateauDatasetItem {
			return plateauDatasetItemFrom(c, id)
		}),
	}
}

func getSubName(d datacatalogv2.DataCatalogItem) string {
	if d.Type2 != "" {
		return d.Type2
	}

	name := strings.TrimSpace(strings.TrimPrefix(
		reBrackets.ReplaceAllString(d.Name, ""),
		d.Type,
	))
	return name
}

func getSubCode(d datacatalogv2.DataCatalogItem) string {
	if d.Type2En != "" {
		return d.Type2En
	}

	ids := strings.SplitN(d.ID, "_", 4)
	if len(ids) > 3 {
		if ids[2] != d.TypeEn {
			return "" // e.g. 01100_sapporo-shi_01103_higashi-ku_bldg
		}

		return trimSuffixes(
			strings.TrimSuffix(ids[3], "_no_texture"),
			"_l1",
			"_l2",
		)
	}

	return ""
}

func plateauDatasetItemFrom(c datacatalogutil.DataCatalogItemConfigItem, parentID plateauapi.ID) *plateauapi.PlateauDatasetItem {
	var lod *int
	if strings.HasPrefix(c.Name, "LOD") {
		l, _, _ := strings.Cut(c.Name[3:], "（")
		lodf, err := strconv.Atoi(l)
		if err == nil {
			lod = &lodf
		}
	}

	format := datasetFormatFrom(c.Type)

	var texture *plateauapi.Texture
	if strings.Contains(c.Name, "（テクスチャなし）") {
		texture = lo.ToPtr(plateauapi.TextureNone)
	} else if format == plateauapi.DatasetFormatCesium3dtiles {
		texture = lo.ToPtr(plateauapi.TextureTexture)
	}

	id := c.Name
	var floodingScale *plateauapi.FloodingScale
	if strings.Contains(c.Name, "想定最大規模") || strings.Contains(c.Name, "L2") {
		floodingScale = lo.ToPtr(plateauapi.FloodingScaleExpectedMaximum)
		id = "l2"
	} else if strings.Contains(c.Name, "計画規模") || strings.Contains(c.Name, "L1") {
		floodingScale = lo.ToPtr(plateauapi.FloodingScalePlanned)
		id = "l1"
	}

	return &plateauapi.PlateauDatasetItem{
		ID:            plateauapi.NewID(fmt.Sprintf("%s_%s", parentID.ID(), id), plateauapi.TypeDatasetItem),
		Name:          c.Name,
		URL:           c.URL,
		Format:        format,
		Layers:        c.Layers,
		ParentID:      parentID,
		Lod:           lod,
		Texture:       texture,
		FloodingScale: floodingScale,
	}
}

var reBrackets = regexp.MustCompile(`（[^（]*）`)

func relatedDatasetFrom(d datacatalogv2.DataCatalogItem) *plateauapi.RelatedDataset {
	if d.Family != "related" {
		return nil
	}

	year := d.Year
	if year == 2021 {
		// 2021年のデータは2020年のデータとして扱うことで
		// マージ後のデータカタログではPLATEAU-2023以降のデータが優先表示されるようにする
		year = 2020
	}

	id := datasetIDFrom(d)
	items := d.MainOrConfigItems()
	return &plateauapi.RelatedDataset{
		ID:                id,
		Name:              d.Name,
		Description:       lo.ToPtr(d.Description),
		OpenDataURL:       lo.EmptyableToPtr(d.OpenDataURL),
		PrefectureID:      prefectureIDFrom(d),
		PrefectureCode:    prefectureCodeFrom(d),
		CityID:            cityIDFrom(d, false),
		CityCode:          cityCodeFrom(d, false),
		WardID:            wardIDFrom(d, false),
		WardCode:          wardCodeFrom(d, false),
		Year:              year,
		RegisterationYear: registrationYear,
		TypeID:            datasetTypeIDFrom(d),
		TypeCode:          datasetTypeCodeFrom(d),
		Groups:            groupsFrom(d),
		Items: lo.Map(items, func(c datacatalogutil.DataCatalogItemConfigItem, i int) *plateauapi.RelatedDatasetItem {
			ind := ""
			if d.TypeEn == "landmark" && landmarkTypes[c.Name] != "" {
				ind = fmt.Sprintf("_%s", landmarkTypes[c.Name])
			}

			var of *plateauapi.DatasetFormat
			if c.OriginalURL != "" {
				of = lo.ToPtr(datasetFormatFrom(c.OriginalFormat))
			}

			return &plateauapi.RelatedDatasetItem{
				ID: plateauapi.NewID(
					fmt.Sprintf("%s%s", id.ID(), ind),
					plateauapi.TypeDatasetItem,
				), // RelatedDatasetItem should be single
				Name:           c.Name,
				Format:         datasetFormatFrom(c.Type),
				URL:            c.URL,
				OriginalFormat: of,
				OriginalURL:    lo.EmptyableToPtr(c.OriginalURL),
				Layers:         c.Layers,
				ParentID:       id,
			}
		}),
	}
}

func genericDatasetFrom(d datacatalogv2.DataCatalogItem) *plateauapi.GenericDataset {
	if d.Family != "generic" {
		return nil
	}

	id := datasetIDFrom(d)
	return &plateauapi.GenericDataset{
		ID:                id,
		Name:              d.Name,
		Description:       lo.ToPtr(d.Description),
		OpenDataURL:       lo.EmptyableToPtr(d.OpenDataURL),
		PrefectureID:      prefectureIDFrom(d),
		PrefectureCode:    prefectureCodeFrom(d),
		CityID:            cityIDFrom(d, false),
		CityCode:          cityCodeFrom(d, false),
		WardID:            wardIDFrom(d, false),
		WardCode:          wardCodeFrom(d, false),
		Year:              d.Year,
		RegisterationYear: registrationYear,
		TypeID:            datasetTypeIDFrom(d),
		TypeCode:          datasetTypeCodeFrom(d),
		Groups:            groupsFrom(d),
		Items: lo.Map(d.MainOrConfigItems(), func(c datacatalogutil.DataCatalogItemConfigItem, i int) *plateauapi.GenericDatasetItem {
			return &plateauapi.GenericDatasetItem{
				ID:       plateauapi.NewID(fmt.Sprintf("%s:%d", d.ID, i), plateauapi.TypeDatasetItem),
				Name:     c.Name,
				URL:      c.URL,
				Format:   datasetFormatFrom(c.Type),
				Layers:   c.Layers,
				ParentID: id,
			}
		}),
	}
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

func isTokyo23ku(d datacatalogv2.DataCatalogItem) bool {
	return d.PrefCode == tokyoCode && (d.CityCode == tokyo23kuCode || d.CityCodeAdmin == tokyo23kuCode || strings.HasSuffix(d.City, "区"))
}

func prefectureIDFrom(d datacatalogv2.DataCatalogItem) *plateauapi.ID {
	if d.PrefCode == "" {
		return nil
	}
	return lo.ToPtr(plateauapi.NewID(d.PrefCode, plateauapi.TypePrefecture))
}

func cityIDFrom(d datacatalogv2.DataCatalogItem, force bool) *plateauapi.ID {
	if !force && hideTokyo23ku && isTokyo23ku(d) {
		return wardIDAsCityIDFrom(d)
	}

	cityCode := lo.FromPtr(cityCodeFrom(d, force)).String()
	if cityCode == "" {
		return nil
	}
	return lo.ToPtr(plateauapi.NewID(cityCode, plateauapi.TypeCity))
}

func wardIDFrom(d datacatalogv2.DataCatalogItem, force bool) *plateauapi.ID {
	if !force && hideTokyo23ku && isTokyo23ku(d) {
		return nil
	}

	wardCode := lo.FromPtr(wardCodeFrom(d, force)).String()
	if wardCode == "" {
		return nil
	}
	return lo.ToPtr(plateauapi.NewID(wardCode, plateauapi.TypeWard))
}

func wardIDAsCityIDFrom(d datacatalogv2.DataCatalogItem) *plateauapi.ID {
	wardCode := lo.FromPtr(wardCodeFrom(d, true)).String()
	if wardCode == "" {
		return nil
	}
	return lo.ToPtr(plateauapi.NewID(wardCode, plateauapi.TypeCity))
}

func prefectureCodeFrom(d datacatalogv2.DataCatalogItem) *plateauapi.AreaCode {
	if d.PrefCode == "" {
		return nil
	}
	return lo.ToPtr(plateauapi.AreaCode(d.PrefCode))
}

func cityCodeFrom(d datacatalogv2.DataCatalogItem, force bool) *plateauapi.AreaCode {
	if !force && hideTokyo23ku && isTokyo23ku(d) {
		return wardCodeFrom(d, true)
	}

	cityCode := d.CityCode
	if cityCode == "" {
		cityCode = d.CityCodeAdmin
	}
	if cityCode == "" {
		return nil
	}
	return lo.ToPtr(plateauapi.AreaCode(cityCode))
}

func wardCodeFrom(d datacatalogv2.DataCatalogItem, force bool) *plateauapi.AreaCode {
	if !force && hideTokyo23ku && isTokyo23ku(d) {
		return nil
	}

	wardCode := d.WardCode
	if wardCode == "" {
		wardCode = d.WardCodeAdmin
	}
	if wardCode == "" {
		return nil
	}
	return lo.ToPtr(plateauapi.AreaCode(wardCode))
}

func datasetIDFrom(d datacatalogv2.DataCatalogItem) plateauapi.ID {
	if d.Family == "plateau" || d.Family == "related" {
		if d.ID != "" && d.Group != "" {
			return newDatasetID(d.ID)
		}

		invalid := false
		areaCode := d.WardCode
		if areaCode == "" {
			areaCode = d.CityCode
		}
		if areaCode == "" {
			areaCode = d.PrefCode
		}

		sub := ""
		if s := getSubCode(d); s != "" {
			sub = fmt.Sprintf("_%s", s)
		}

		if !invalid {
			return newDatasetID(fmt.Sprintf("%s_%s%s", areaCode, datasetTypeCodeFrom(d), sub))
		}
	}

	return newDatasetID(d.ID)
}

func newDatasetID(id string) plateauapi.ID {
	return plateauapi.NewID(id, plateauapi.TypeDataset)
}

func datasetTypeIDFrom(d datacatalogv2.DataCatalogItem) plateauapi.ID {
	code := datasetTypeCodeFrom(d)
	if d.Family == "plateau" {
		if d.Group != "" {
			return plateauapi.NewID("sample", plateauapi.TypeDatasetType)
		}

		spec := d.Spec
		if isEx(d) {
			spec = "3.0"
		}
		return plateauapi.NewID(fmt.Sprintf("%s_%s", code, majorVersion(spec)), plateauapi.TypeDatasetType)
	}
	return plateauapi.NewID(code, plateauapi.TypeDatasetType)
}

func datasetTypeCodeFrom(d datacatalogv2.DataCatalogItem) string {
	if d.Family == "plateau" {
		if d.Group != "" {
			return "sample"
		}

		if strings.HasPrefix(d.TypeEn, "urf_") {
			return "urf"
		}
		return d.TypeEn
	}
	if d.Family == "related" {
		return d.TypeEn
	}
	if d.Family == "generic" && d.Category != "" {
		if d.Category == "サンプルデータ" {
			return "sample"
		}
		return d.Category
	}
	if d.PrefCode == "" {
		return globalID
	}
	return usecaseID
}

func plateauSpecIDFrom(version string) plateauapi.ID {
	return plateauapi.NewID(specNumber(version), plateauapi.TypePlateauSpec)
}

func plateauSpecMajorIDFrom(version string) plateauapi.ID {
	return plateauapi.NewID(majorVersion(version), plateauapi.TypePlateauSpec)
}

func specNumber(spec string) string {
	return strings.TrimSuffix(strings.TrimPrefix(spec, "第"), "版")
}

func prefectureFrom(d datacatalogv2.DataCatalogItem) *plateauapi.Prefecture {
	if d.PrefCode == "" {
		return nil
	}

	return &plateauapi.Prefecture{
		ID:   *prefectureIDFrom(d),
		Type: plateauapi.AreaTypePrefecture,
		Code: *prefectureCodeFrom(d),
		Name: d.Pref,
	}
}

func cityFrom(d datacatalogv2.DataCatalogItem, force bool) *plateauapi.City {
	planarCrsEpsgCode := lo.EmptyableToPtr(d.PRCS.EPSGCode())

	cityCode := d.CityCode
	if isTokyo23ku(d) {
		cityCode = tokyo23kuCode
	}

	citygml := lo.ToPtr(plateauapi.CityGMLDatasetIDFrom(plateauapi.AreaCode(cityCode)))

	if !force && hideTokyo23ku && isTokyo23ku(d) {
		ward := wardFrom(d, true)
		cityID := wardIDAsCityIDFrom(d)

		if ward != nil && cityID != nil {
			return &plateauapi.City{
				ID:                *cityID,
				Type:              plateauapi.AreaTypeCity,
				Code:              ward.Code,
				Name:              ward.Name,
				PrefectureID:      ward.PrefectureID,
				PrefectureCode:    ward.PrefectureCode,
				PlanarCrsEpsgCode: planarCrsEpsgCode,
				CitygmlID:         citygml,
			}
		}
	}

	id, code := cityIDFrom(d, force), cityCodeFrom(d, force)
	if id == nil || code == nil {
		return nil
	}

	codestr := code.String()
	_ = codestr

	return &plateauapi.City{
		ID:                *id,
		Type:              plateauapi.AreaTypeCity,
		Code:              *code,
		Name:              d.City,
		PrefectureID:      *prefectureIDFrom(d),
		PrefectureCode:    *prefectureCodeFrom(d),
		PlanarCrsEpsgCode: planarCrsEpsgCode,
		CitygmlID:         citygml,
	}
}

func tokyo23kuCityFrom(d datacatalogv2.DataCatalogItem) *plateauapi.City {
	if !isTokyo23ku(d) {
		return nil
	}

	return cityFrom(d, true)
}

func citygmlFrom(d datacatalogv2.DataCatalogItem, i *fetcherPlateauItem2) *plateauapi.CityGMLDataset {
	if i == nil || d.Spec == "" || !i.SDKPublic || i.CityGMLURL == "" || i.MaxLODURL == "" || len(i.FeatureTypes) == 0 || isTokyo23ku(d) && d.CityCode != tokyo23kuCode {
		return nil
	}

	id, code := cityIDFrom(d, true), cityCodeFrom(d, true)
	if id == nil || code == nil {
		return nil
	}

	return &plateauapi.CityGMLDataset{
		ID:                 plateauapi.CityGMLDatasetIDFrom(plateauapi.AreaCode(d.CityCode)),
		Year:               d.Year,
		RegistrationYear:   registrationYear,
		PrefectureID:       *prefectureIDFrom(d),
		PrefectureCode:     *prefectureCodeFrom(d),
		CityID:             *id,
		CityCode:           *code,
		PlateauSpecMinorID: plateauSpecIDFrom(d.Spec),
		URL:                i.CityGMLURL,
		FeatureTypes:       i.FeatureTypes,
		Admin: map[string]any{
			"maxlod":         []string{i.MaxLODURL},
			"citygmlUrl":     []string{i.CityGMLURL},
			"citygmlAssetId": i.CityGMLAssetID,
		},
	}
}

func wardFrom(d datacatalogv2.DataCatalogItem, force bool) *plateauapi.Ward {
	if !force && hideTokyo23ku && isTokyo23ku(d) {
		return nil
	}

	id, code := wardIDFrom(d, true), wardCodeFrom(d, true)
	if id == nil || code == nil {
		return nil
	}

	cityid, citycode := cityIDFrom(d, true), cityCodeFrom(d, true)
	if cityid == nil || citycode == nil {
		return nil
	}

	return &plateauapi.Ward{
		ID:             *id,
		Type:           plateauapi.AreaTypeWard,
		Code:           *code,
		Name:           d.Ward,
		PrefectureID:   *prefectureIDFrom(d),
		PrefectureCode: *prefectureCodeFrom(d),
		CityID:         *cityid,
		CityCode:       *citycode,
	}
}

func plateauDatasetTypeFrom(d datacatalogv2.DataCatalogItem) *plateauapi.PlateauDatasetType {
	if d.Family != "plateau" {
		return nil
	}

	code := datasetTypeCodeFrom(d)
	if code == "sample" {
		return nil
	}

	name := d.Type
	if strings.HasPrefix(d.TypeEn, "urf_") {
		name = "都市計画決定情報モデル"
	}
	spec := d.Spec
	if isEx(d) {
		spec = "3.0"
	}

	year, _ := strconv.Atoi(d.Edition)
	order := slices.Index(types, code) + 1
	if order <= 0 {
		order = len(types) + 1
	}
	return &plateauapi.PlateauDatasetType{
		ID:            datasetTypeIDFrom(d),
		Name:          name,
		Code:          code,
		Year:          year,
		Category:      plateauapi.DatasetTypeCategoryPlateau,
		PlateauSpecID: plateauSpecMajorIDFrom(spec),
		Flood:         slices.Contains(floodingTypes, d.TypeEn),
		Order:         order,
	}
}

func relatedDatasetTypeFrom(d datacatalogv2.DataCatalogItem) plateauapi.RelatedDatasetType {
	if d.Family != "related" {
		return plateauapi.RelatedDatasetType{}
	}

	return plateauapi.RelatedDatasetType{
		ID:       datasetTypeIDFrom(d),
		Name:     d.Type,
		Code:     datasetTypeCodeFrom(d),
		Category: plateauapi.DatasetTypeCategoryRelated,
	}
}

func genericDatasetTypeFrom(d datacatalogv2.DataCatalogItem) plateauapi.GenericDatasetType {
	if d.Family == "plateau" {
		if code := datasetTypeCodeFrom(d); code == "sample" {
			return plateauapi.GenericDatasetType{
				ID:       datasetTypeIDFrom(d),
				Name:     "サンプルデータ",
				Code:     code,
				Category: plateauapi.DatasetTypeCategoryGeneric,
			}
		}
	}

	if d.Family != "generic" {
		return plateauapi.GenericDatasetType{}
	}

	if d.Category != "" {
		return plateauapi.GenericDatasetType{
			ID:       datasetTypeIDFrom(d),
			Name:     d.Category,
			Code:     datasetTypeCodeFrom(d),
			Category: plateauapi.DatasetTypeCategoryGeneric,
		}
	}

	if d.PrefCode == "" {
		return plateauapi.GenericDatasetType{
			ID:       datasetTypeIDFrom(d),
			Name:     "全球データ",
			Code:     globalID,
			Category: plateauapi.DatasetTypeCategoryGeneric,
		}
	}

	return plateauapi.GenericDatasetType{
		ID:       datasetTypeIDFrom(d),
		Name:     "ユースケース",
		Code:     "usecase",
		Category: plateauapi.DatasetTypeCategoryGeneric,
	}
}

var sampleDataType = plateauapi.GenericDatasetType{
	ID:       plateauapi.NewID("sample", plateauapi.TypeDatasetType),
	Name:     "サンプル",
	Code:     "sample",
	Category: plateauapi.DatasetTypeCategoryGeneric,
}

func groupsFrom(d datacatalogv2.DataCatalogItem) []string {
	if d.Group == "" {
		return nil
	}
	return strings.Split(d.Group, "/")
}

func majorVersion(version string) string {
	v := specNumber(version)
	i := strings.Index(v, ".")
	if i < 0 {
		return version
	}
	return v[:i]
}

func isEx(d datacatalogv2.DataCatalogItem) bool {
	return strings.Contains(d.ID, "_ex_")
}

func trimSuffixes(s string, suffixes ...string) string {
	for _, suffix := range suffixes {
		s = strings.TrimSuffix(s, suffix)
	}
	return s
}
