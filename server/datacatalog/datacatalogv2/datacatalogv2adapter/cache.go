package datacatalogv2adapter

import (
	"context"
	"fmt"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2"
	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"golang.org/x/exp/slices"
)

func fetchAndCreateCache(ctx context.Context, fetcher *Fetcher) (*plateauapi.InMemoryRepo, error) {
	r, err := fetcher.Fetch(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to update datacatalog cache: %w", err)
	}

	all := r.Base.All()
	return plateauapi.NewInMemoryRepo(newCache(all, r.PlateauItems)), nil
}

func newCache(items []datacatalogv2.DataCatalogItem, m map[string]*fetcherPlateauItem2) *plateauapi.InMemoryRepoContext {
	cache := &plateauapi.InMemoryRepoContext{
		PlateauSpecs: plateauSpecs,
	}

	areas := make(map[plateauapi.AreaCode]struct{})

	for _, d := range items {
		prefCode := plateauapi.AreaCode(d.PrefCode)
		if _, found := areas[prefCode]; !found {
			if p := prefectureFrom(d); p != nil {
				if cache.Areas == nil {
					cache.Areas = make(plateauapi.Areas)
				}
				cache.Areas.Append(plateauapi.AreaTypePrefecture, []plateauapi.Area{p})
				areas[prefCode] = struct{}{}
			}
		}

		if d.City != "" {
			areaCode := plateauapi.AreaCode(d.CityCode)
			if _, found := areas[areaCode]; !found {
				if c := cityFrom(d); c != nil {
					if cache.Areas == nil {
						cache.Areas = make(plateauapi.Areas)
					}
					cache.Areas.Append(plateauapi.AreaTypeCity, []plateauapi.Area{c})
					areas[areaCode] = struct{}{}
				}
			}
		}

		if d.Ward != "" {
			areaCode := plateauapi.AreaCode(d.WardCode)
			if _, found := areas[areaCode]; !found {
				if w := wardFrom(d); w != nil {
					if cache.Areas == nil {
						cache.Areas = make(plateauapi.Areas)
					}
					cache.Areas.Append(plateauapi.AreaTypeWard, []plateauapi.Area{w})
					areas[areaCode] = struct{}{}
				}
			}
		}

		if ty := plateauDatasetTypeFrom(d); ty.ID != "" {
			if cache.DatasetTypes.DatasetType(ty.ID) == nil {
				if cache.DatasetTypes == nil {
					cache.DatasetTypes = make(plateauapi.DatasetTypes)
				}
				cache.DatasetTypes.Append(plateauapi.DatasetTypeCategoryPlateau, []plateauapi.DatasetType{&ty})
			}
		}

		if ty := relatedDatasetTypeFrom(d); ty.ID != "" {
			if cache.DatasetTypes.DatasetType(ty.ID) == nil {
				if cache.DatasetTypes == nil {
					cache.DatasetTypes = make(plateauapi.DatasetTypes)
				}
				cache.DatasetTypes.Append(plateauapi.DatasetTypeCategoryRelated, []plateauapi.DatasetType{&ty})
			}
		}

		if ty := genericDatasetTypeFrom(d); ty.ID != "" {
			if cache.DatasetTypes.DatasetType(ty.ID) == nil {
				if cache.DatasetTypes == nil {
					cache.DatasetTypes = make(plateauapi.DatasetTypes)
				}
				cache.DatasetTypes.Append(plateauapi.DatasetTypeCategoryGeneric, []plateauapi.DatasetType{&ty})
			}
		}

		if d := plateauDatasetFrom(d); d != nil {
			if cache.Datasets == nil {
				cache.Datasets = make(plateauapi.Datasets)
			}
			cache.Datasets.Append(plateauapi.DatasetTypeCategoryPlateau, []plateauapi.Dataset{d})
		}
		if d := relatedDatasetFrom(d); d != nil {
			if cache.Datasets == nil {
				cache.Datasets = make(plateauapi.Datasets)
			}
			cache.Datasets.Append(plateauapi.DatasetTypeCategoryRelated, []plateauapi.Dataset{d})
		}
		if d := genericDatasetFrom(d); d != nil {
			if cache.Datasets == nil {
				cache.Datasets = make(plateauapi.Datasets)
			}
			cache.Datasets.Append(plateauapi.DatasetTypeCategoryGeneric, []plateauapi.Dataset{d})
		}
		if !slices.Contains(cache.Years, d.Year) {
			cache.Years = append(cache.Years, d.Year)
		}

		if citygml := citygmlFrom(d, m[d.ItemID]); citygml != nil {
			if cache.CityGML == nil {
				cache.CityGML = map[plateauapi.ID]*plateauapi.CityGMLDataset{}
			}

			cg := cache.CityGML[citygml.ID]
			if cg == nil || cg.Year < citygml.Year {
				cache.CityGML[citygml.ID] = citygml
			}
		}
	}

	slices.SortStableFunc(cache.Years, func(a, b int) int {
		return a - b
	})

	return cache
}
