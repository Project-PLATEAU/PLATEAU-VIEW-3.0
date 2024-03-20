package plateauapi

import (
	"context"
	"fmt"
	"slices"

	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type InMemoryRepoContext struct {
	Name         string
	Areas        Areas
	DatasetTypes DatasetTypes
	Datasets     Datasets
	PlateauSpecs []PlateauSpec
	Years        []int
	CityGML      map[ID]*CityGMLDataset
}

// InMemoryRepo is a repository that stores all data in memory.
// Note that it is not thread-safe.
type InMemoryRepo struct {
	ctx               *InMemoryRepoContext
	areasForDataTypes map[string]map[AreaCode]bool
}

var _ Repo = (*InMemoryRepo)(nil)

func NewInMemoryRepo(ctx *InMemoryRepoContext) *InMemoryRepo {
	r := &InMemoryRepo{}
	r.SetContext(ctx)
	return r
}

func (c *InMemoryRepo) Name() string {
	if c.ctx == nil || c.ctx.Name == "" {
		return "inmemory"
	}
	return fmt.Sprintf("inmemory(%s)", c.ctx.Name)
}

func (c *InMemoryRepo) SetContext(ctx *InMemoryRepoContext) {
	c.ctx = ctx
	c.areasForDataTypes = areasForDatasetTypes(ctx.Datasets.All())
}

func (c *InMemoryRepo) Node(ctx context.Context, id ID) (Node, error) {
	ty := id.Type()
	switch ty {
	case TypePrefecture:
		fallthrough
	case TypeCity:
		fallthrough
	case TypeWard:
		if a := c.ctx.Areas.Area(id); a != nil {
			return a, nil
		}
	case TypeDatasetType:
		if dt := c.ctx.DatasetTypes.DatasetType(id); dt != nil {
			return dt, nil
		}
	case TypeDataset:
		if d := c.ctx.Datasets.Dataset(id); d != nil {
			stages := allowAdminStages(ctx)
			if filterDataset(d, DatasetsInput{}, stages) {
				return removeAdminFromDataset(ctx, d, false), nil
			}
		}
	case TypeDatasetItem:
		if i := c.ctx.Datasets.Item(id); i != nil {
			return i, nil
		}
	case TypePlateauSpec:
		if p, ok := lo.Find(c.ctx.PlateauSpecs, func(p PlateauSpec) bool {
			return p.ID == id || lo.SomeBy(p.MinorVersions, func(v *PlateauSpecMinor) bool {
				return v.ID == id
			})
		}); ok {
			if p.ID != id {
				m, _ := lo.Find(p.MinorVersions, func(v *PlateauSpecMinor) bool {
					return v.ID == id
				})
				return m, nil
			}
			return &p, nil
		}
	case TypeCityGML:
		stages := allowAdminStages(ctx)
		if d := c.ctx.CityGML[id]; d != nil && filterCityGMLDataset(d, stages) {
			return removeAdminFromCityGMLDataset(ctx, d), nil
		}
	}

	return nil, nil
}

func (c *InMemoryRepo) Nodes(ctx context.Context, ids []ID) ([]Node, error) {
	return util.TryMap(ids, func(id ID) (Node, error) {
		return c.Node(ctx, id)
	})
}

func (c *InMemoryRepo) Area(ctx context.Context, code AreaCode) (Area, error) {
	return c.ctx.Areas.Find(func(a Area) bool {
		return a.GetCode() == code
	}), nil
}

func (c *InMemoryRepo) Areas(ctx context.Context, input *AreasInput) (res []Area, _ error) {
	inp := lo.FromPtr(input)
	types := c.getDatasetTypeCodes(inp.DatasetTypes, inp.Categories)

	var codes []AreaCode
	if inp.DatasetTypes != nil {
		for _, t := range types {
			for k, v := range c.areasForDataTypes[t] {
				if input.IncludeParents != nil && *input.IncludeParents || v {
					codes = append(codes, k)
				}
			}
		}
	}

	res = c.ctx.Areas.Filter(func(a Area) bool {
		if !filterArea(a, inp) {
			return false
		}

		if inp.DatasetTypes != nil && !lo.Contains(codes, a.GetCode()) {
			return false
		}

		return true
	})
	return
}

func (c *InMemoryRepo) DatasetTypes(ctx context.Context, input *DatasetTypesInput) (res []DatasetType, _ error) {
	inp := lo.FromPtr(input)
	return c.ctx.DatasetTypes.Filter(func(t DatasetType) bool {
		return filterDatasetType(t, inp)
	}), nil
}

func (c *InMemoryRepo) Datasets(ctx context.Context, input *DatasetsInput) (res []Dataset, _ error) {
	if input == nil {
		input = &DatasetsInput{}
	}

	stages := allowAdminStages(ctx)
	return removeAdminFromDatasets(ctx, c.ctx.Datasets.Filter(func(t Dataset) bool {
		return filterDataset(t, *input, stages)
	})), nil
}

func (c *InMemoryRepo) PlateauSpecs(ctx context.Context) ([]*PlateauSpec, error) {
	return lo.Map(c.ctx.PlateauSpecs, func(p PlateauSpec, _ int) *PlateauSpec {
		return &p
	}), nil
}

func (c *InMemoryRepo) Years(ctx context.Context) ([]int, error) {
	return slices.Clone(c.ctx.Years), nil
}

func (c *InMemoryRepo) getDatasetTypeCodes(types []string, categories []DatasetTypeCategory) (res []string) {
	if len(categories) == 0 {
		categories = AllDatasetTypeCategory
	}
	dt := c.ctx.DatasetTypes.DatasetTypesByCategories(categories)

	for _, t := range dt {
		code := t.GetCode()
		if len(types) > 0 && !slices.Contains(types, code) {
			continue
		}
		res = append(res, code)
	}
	return res
}

func areasForDatasetTypes(ds []Dataset) map[string]map[AreaCode]bool {
	// true -> most detailed, false -> not most detailed
	res := make(map[string]map[AreaCode]bool)

	for _, d := range ds {
		datasetTypeCode := d.GetTypeCode()

		codes := areaCodesFrom(d)
		code := mostDetailedAreaCodeFrom(d)

		for _, c := range codes {
			mostDetailed := code != nil && c == *code
			if _, ok := res[datasetTypeCode]; !ok {
				res[datasetTypeCode] = make(map[AreaCode]bool)
			}
			if _, ok := res[datasetTypeCode][c]; !ok || mostDetailed {
				res[datasetTypeCode][c] = mostDetailed
			}
		}
	}

	return res
}

func removeAdminFromDatasets(ctx context.Context, ds []Dataset) []Dataset {
	if bypassAdminRemoval(ctx) {
		return ds
	}

	return lo.Map(ds, func(d Dataset, _ int) Dataset {
		return removeAdminFromDataset(ctx, d, true)
	})
}

func removeAdminFromDataset(ctx context.Context, d Dataset, force bool) Dataset {
	if !force && (bypassAdminRemoval(ctx)) {
		return d
	}

	switch e := d.(type) {
	case *PlateauDataset:
		f := *e
		f.Admin = nil
		return &f
	case *RelatedDataset:
		f := *e
		f.Admin = nil
		return &f
	case *GenericDataset:
		f := *e
		f.Admin = nil
		return &f
	case PlateauDataset:
		e.Admin = nil
		return e
	case RelatedDataset:
		e.Admin = nil
		return e
	case GenericDataset:
		e.Admin = nil
		return e
	}
	return d
}

func removeAdminFromCityGMLDataset(ctx context.Context, d *CityGMLDataset) *CityGMLDataset {
	if bypassAdminRemoval(ctx) {
		return d
	}

	d2 := *d
	d2.Admin = nil
	return &d2
}
