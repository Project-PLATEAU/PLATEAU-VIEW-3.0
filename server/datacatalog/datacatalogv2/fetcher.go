package datacatalogv2

import (
	"context"
	"errors"
	"net/url"
	"path"
	"time"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

const timeoutSecond int64 = 20
const ModelPlateau = "plateau"
const ModelDataset = "dataset"
const ModelUsecase = "usecase"

type Fetchable interface {
	Do(ctx context.Context, project string, opts FetcherDoOptions) (ResponseAll, error)
}

type Fetcher struct {
	cmsp *cms.PublicAPIClient[PlateauItem]
	cmsd *cms.PublicAPIClient[DatasetItem]
	cmsu *cms.PublicAPIClient[UsecaseItem]
	base *url.URL
}

type FetcherDoOptions struct {
	Subproject             string
	CityName               string
	HideUsacaseCityAndWard bool
}

func NewFetcher(cmsbase string) (*Fetcher, error) {
	u, err := url.Parse(cmsbase)
	if err != nil {
		return nil, err
	}

	u.Path = path.Join(u.Path, "api", "p")

	cmsp, err := cms.NewPublicAPIClient[any](nil, cmsbase)
	if err != nil {
		return nil, err
	}

	cmsp = cmsp.WithTimeout(time.Duration(timeoutSecond) * time.Second)

	return &Fetcher{
		cmsp: cms.ChangePublicAPIClientType[any, PlateauItem](cmsp),
		cmsd: cms.ChangePublicAPIClientType[any, DatasetItem](cmsp),
		cmsu: cms.ChangePublicAPIClientType[any, UsecaseItem](cmsp),
		base: u,
	}, nil
}

func (f *Fetcher) Clone() *Fetcher {
	if f == nil {
		return nil
	}

	return &Fetcher{
		cmsp: f.cmsp.Clone(),
		cmsd: f.cmsd.Clone(),
		cmsu: f.cmsu.Clone(),
		base: util.CloneRef(f.base),
	}
}

func (f *Fetcher) Do(ctx context.Context, project string, opts FetcherDoOptions) (ResponseAll, error) {
	f1, f2, f3, f4, f5 := f.Clone(), f.Clone(), f.Clone(), f.Clone(), f.Clone()

	res1 := lo.Async2(func() ([]PlateauItem, error) {
		return f1.plateau(ctx, project)
	})
	res2 := lo.Async2(func() ([]UsecaseItem, error) {
		return f2.usecase(ctx, project, opts.HideUsacaseCityAndWard)
	})
	res3 := lo.Async2(func() ([]DatasetItem, error) {
		return f3.dataset(ctx, project)
	})
	res4 := lo.Async2(func() ([]PlateauItem, error) {
		if opts.CityName == "" || opts.Subproject == "" {
			return nil, nil
		}
		return f4.plateau(ctx, opts.Subproject)
	})
	res5 := lo.Async2(func() ([]DatasetItem, error) {
		if opts.CityName == "" || opts.Subproject == "" {
			return nil, nil
		}
		return f5.dataset(ctx, opts.Subproject)
	})

	notFound := 0
	r := ResponseAll{}

	if res := <-res1; res.B != nil {
		if errors.Is(res.B, cms.ErrNotFound) {
			notFound++
		} else {
			return ResponseAll{}, res.B
		}
	} else {
		r.Plateau = append(r.Plateau, res.A...)
	}

	if res := <-res2; res.B != nil {
		if errors.Is(res.B, cms.ErrNotFound) {
			notFound++
		} else {
			return ResponseAll{}, res.B
		}
	} else {
		r.Usecase = append(r.Usecase, res.A...)
	}

	if res := <-res3; res.B != nil {
		if errors.Is(res.B, cms.ErrNotFound) {
			notFound++
		} else {
			return ResponseAll{}, res.B
		}
	} else {
		r.Dataset = append(r.Dataset, res.A...)
	}

	if res := <-res4; res.B != nil {
		if errors.Is(res.B, cms.ErrNotFound) {
			notFound++
		} else {
			return ResponseAll{}, res.B
		}
	} else {
		r.Plateau = append(r.Plateau, filterItemsByCityName(res.A, opts.CityName)...)
	}

	if res := <-res5; res.B != nil {
		if errors.Is(res.B, cms.ErrNotFound) {
			notFound++
		} else {
			return ResponseAll{}, res.B
		}
	} else {
		r.Dataset = append(r.Dataset, filterItemsByCityName(res.A, opts.CityName)...)
	}

	if notFound == 3 {
		return r, rerror.ErrNotFound
	}
	return r, nil
}

func (f *Fetcher) plateau(ctx context.Context, project string) ([]PlateauItem, error) {
	return f.cmsp.GetAllItemsInParallel(ctx, project, ModelPlateau, 10)
}

func (f *Fetcher) dataset(ctx context.Context, project string) ([]DatasetItem, error) {
	return f.cmsd.GetAllItemsInParallel(ctx, project, ModelDataset, 10)
}

func (f *Fetcher) usecase(ctx context.Context, project string, hideCityAndWard bool) ([]UsecaseItem, error) {
	res, err := f.cmsu.GetAllItemsInParallel(ctx, project, ModelUsecase, 10)
	if hideCityAndWard {
		for i := range res {
			res[i].hideCityAndWard = true
		}
	}
	return res, err
}

func filterItemsByCityName[T ItemCommon](items []T, cityName string) []T {
	if cityName == "" {
		return nil
	}

	return lo.Filter(items, func(v T, _ int) bool {
		return v.GetCityName() == cityName
	})
}
