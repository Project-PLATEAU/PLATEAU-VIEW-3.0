package plateauapi

import (
	"context"
	"strings"

	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

const SpecVersion = "2.3"

func ParentAreaCode(a Area) AreaCode {
	switch a2 := a.(type) {
	case *City:
		if a2 != nil {
			return a2.PrefectureCode
		}
	case *Ward:
		if a2 != nil {
			return a2.CityCode
		}
	case City:
		return a2.PrefectureCode
	case Ward:
		return a2.CityCode
	}
	return ""
}

func filterDataset(d Dataset, input DatasetsInput, stages []string) bool {
	if d == nil {
		return false
	}

	if s := stageFrom(d.GetAdmin()); s != "" && (len(stages) == 0 || !slices.Contains(stages, s)) {
		return false
	}

	if len(input.AreaCodes) > 0 {
		var areaCodes []AreaCode
		if lo.FromPtr(input.Shallow) {
			areaCodes = util.DerefSlice([]*AreaCode{areaCodeFrom(d)})
		} else {
			areaCodes = areaCodesFrom(d)
		}

		if lo.EveryBy(input.AreaCodes, func(code AreaCode) bool {
			return !slices.Contains(areaCodes, code)
		}) {
			return false
		}
	}

	if input.Year != nil && *input.Year != d.GetYear() {
		return false
	}

	if input.RegistrationYear != nil && *input.RegistrationYear != d.GetRegisterationYear() {
		return false
	}

	text := []string{
		d.GetName(),
		lo.FromPtr(d.GetDescription()),
	}
	var spec string
	switch d2 := d.(type) {
	case *PlateauDataset:
		if d2 != nil {
			spec = string(d2.PlateauSpecMinorID)
			if d2.Subname != nil {
				text = append(text, *d2.Subname)
			}
			if d2.Subcode != nil {
				text = append(text, *d2.Subcode)
			}
		}
	case PlateauDataset:
		spec = string(d2.PlateauSpecMinorID)
	}

	if !filterByPlateauSpec(input.PlateauSpec, spec) {
		return false
	}

	if !filterByCode(d.GetTypeCode(), DatasetTypeCategoryFromDataset(d), input.IncludeTypes, input.ExcludeTypes) {
		return false
	}

	if len(input.SearchTokens) > 0 {
		// all tokens must be included in at least one of the text
		if lo.SomeBy(input.SearchTokens, func(t string) bool {
			return lo.EveryBy(text, func(t2 string) bool {
				return t2 == "" || !strings.Contains(t2, t)
			})
		}) {
			return false
		}
	}

	return true
}

func filterByPlateauSpec(querySpec *string, datasetSpec string) bool {
	if querySpec == nil || *querySpec == "" {
		return true
	}

	if datasetSpec == "" {
		return false
	}

	s1, s2 := SpecNumber(*querySpec), SpecNumber(datasetSpec)
	return s1 == s2 || s1 == MajorVersion(s2)
}

func filterByCode(code string, category DatasetTypeCategory, includes []string, excludes []string) bool {
	code = strings.ToLower(code)
	cat := strings.ToLower(category.String())

	if len(excludes) > 0 {
		if lo.SomeBy(excludes, func(t string) bool {
			s := strings.ToLower(t)
			return code != "" && s == code || cat != "" && s == cat
		}) {
			return false
		}
	}

	if len(includes) > 0 {
		if lo.EveryBy(includes, func(t string) bool {
			s := strings.ToLower(t)
			return (code == "" || s != code) && (cat == "" || s != cat)
		}) {
			return false
		}
	}

	return true
}

func areaCodeFrom(d Dataset) *AreaCode {
	switch d2 := d.(type) {
	case PlateauDataset:
		return d2.WardCode
	case RelatedDataset:
		return d2.WardCode
	case GenericDataset:
		return d2.WardCode
	case *PlateauDataset:
		if d2 == nil {
			return nil
		}
		if d2.WardCode != nil {
			return d2.WardCode
		}
		if d2.CityCode != nil {
			return d2.CityCode
		}
		return d2.PrefectureCode
	case *RelatedDataset:
		if d2 == nil {
			return nil
		}
		if d2.WardCode != nil {
			return d2.WardCode
		}
		if d2.CityCode != nil {
			return d2.CityCode
		}
		return d2.PrefectureCode
	case *GenericDataset:
		if d2 == nil {
			return nil
		}
		if d2.WardCode != nil {
			return d2.WardCode
		}
		if d2.CityCode != nil {
			return d2.CityCode
		}
		return d2.PrefectureCode
	}
	return nil
}

func areaCodesFrom(d Dataset) []AreaCode {
	switch d2 := d.(type) {
	case PlateauDataset:
		return util.DerefSlice([]*AreaCode{
			d2.PrefectureCode,
			d2.CityCode,
			d2.WardCode,
		})
	case RelatedDataset:
		return util.DerefSlice([]*AreaCode{
			d2.PrefectureCode,
			d2.CityCode,
			d2.WardCode,
		})
	case GenericDataset:
		return util.DerefSlice([]*AreaCode{
			d2.PrefectureCode,
			d2.CityCode,
			d2.WardCode,
		})
	case *PlateauDataset:
		if d2 == nil {
			return nil
		}
		return util.DerefSlice([]*AreaCode{
			d2.PrefectureCode,
			d2.CityCode,
			d2.WardCode,
		})
	case *RelatedDataset:
		if d2 == nil {
			return nil
		}
		return util.DerefSlice([]*AreaCode{
			d2.PrefectureCode,
			d2.CityCode,
			d2.WardCode,
		})
	case *GenericDataset:
		if d2 == nil {
			return nil
		}
		return util.DerefSlice([]*AreaCode{
			d2.PrefectureCode,
			d2.CityCode,
			d2.WardCode,
		})
	}
	return nil
}

func mostDetailedAreaCodeFrom(d Dataset) *AreaCode {
	if c := d.GetWardCode(); c != nil {
		return util.CloneRef(c)
	}
	if c := d.GetCityCode(); c != nil {
		return util.CloneRef(c)
	}
	if c := d.GetPrefectureCode(); c != nil {
		return util.CloneRef(c)
	}
	return nil
}

func filterArea(area Area, input AreasInput) bool {
	if area == nil {
		return false
	}

	if len(input.AreaTypes) > 0 {
		ty := area.GetType()
		if ty == "" || !slices.Contains(input.AreaTypes, ty) {
			return false
		}
	}

	testName := func(name string) bool {
		return len(input.SearchTokens) == 0 || lo.SomeBy(input.SearchTokens, func(t string) bool {
			return strings.Contains(name, t)
		})
	}

	if !testName(area.GetName()) {
		return false
	}

	if input.ParentCode != nil {
		pc := ParentAreaCode(area)
		if pc != *input.ParentCode {
			return false
		}
	}

	return true
}

func filterDatasetType(ty DatasetType, input DatasetTypesInput) bool {
	if ty == nil || input.Category != nil && *input.Category != ty.GetCategory() {
		return false
	}

	var year int
	var spec string

	switch ty2 := ty.(type) {
	case *PlateauDatasetType:
		if ty2 == nil {
			return false
		}
		year = ty2.Year
		spec = string(ty2.PlateauSpecID)
	case PlateauDatasetType:
		year = ty2.Year
		spec = string(ty2.PlateauSpecID)
	}

	if input.Year != nil && (year == 0 || year != *input.Year) {
		return false
	}

	if input.PlateauSpec != nil && (spec == "" || !filterByPlateauSpec(input.PlateauSpec, spec)) {
		return false
	}

	return true
}

func filterCityGMLDataset(d *CityGMLDataset, stages []string) bool {
	if d == nil {
		return false
	}

	if s := stageFromCityGMLDataset(d); s != "" && (len(stages) == 0 || !slices.Contains(stages, s)) {
		return false
	}

	return true
}

type bypassAdminRemovalKey struct{}

func BypassAdminRemoval(ctx context.Context, b bool) context.Context {
	return context.WithValue(ctx, bypassAdminRemovalKey{}, b)
}

func bypassAdminRemoval(ctx context.Context) bool {
	b, _ := ctx.Value(bypassAdminRemovalKey{}).(bool)
	return b
}

type allowedAdminStagesKey struct{}

func AllowAdminStages(ctx context.Context, stages []string) context.Context {
	return context.WithValue(ctx, allowedAdminStagesKey{}, stages)
}

func allowAdminStages(ctx context.Context) []string {
	b, _ := ctx.Value(allowedAdminStagesKey{}).([]string)
	return b
}
