package datacatalogv2adapter

import (
	"context"
	"fmt"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2"
	cms "github.com/reearth/reearth-cms-api/go"
	"golang.org/x/sync/errgroup"
)

const modelPlateau = datacatalogv2.ModelPlateau

type Fetcher struct {
	baseFetcher datacatalogv2.Fetchable
	cms         cms.Interface
	project     string
	opts        datacatalogv2.FetcherDoOptions
}

type ResponseAll struct {
	Base         datacatalogv2.ResponseAll
	PlateauItems map[string]*fetcherPlateauItem2
}

func NewFetcher(baseFetcher datacatalogv2.Fetchable, cms cms.Interface, project string, opts datacatalogv2.FetcherDoOptions) *Fetcher {
	return &Fetcher{
		baseFetcher: baseFetcher,
		cms:         cms,
		project:     project,
		opts:        opts,
	}
}

func (f *Fetcher) Project() string {
	return f.project
}

func (f *Fetcher) Fetch(ctx context.Context) (*ResponseAll, error) {
	base, items, err := f.fetchBoth(ctx)
	if err != nil {
		return nil, err
	}

	return &ResponseAll{
		Base:         base,
		PlateauItems: items,
	}, nil
}

func (f *Fetcher) fetchBoth(ctx context.Context) (resp datacatalogv2.ResponseAll, items map[string]*fetcherPlateauItem2, err error) {
	errg := new(errgroup.Group)

	errg.Go(func() error {
		var err error
		resp, err = f.baseFetcher.Do(ctx, f.project, f.opts)
		if err != nil {
			err = fmt.Errorf("failed to get base data from base fetcher: %w", err)
		}
		return err
	})

	errg.Go(func() error {
		var err error
		items, err = f.fetchItemsFromIntegrationAPI(ctx)
		if err != nil {
			err = fmt.Errorf("failed to get items from integration api: %w", err)
		}
		return err
	})

	err = errg.Wait()
	return
}

func (f *Fetcher) fetchItemsFromIntegrationAPI(ctx context.Context) (map[string]*fetcherPlateauItem2, error) {
	items, err := f.cms.GetItemsByKeyInParallel(ctx, f.project, modelPlateau, true, 100)
	if err != nil || items == nil {
		return nil, fmt.Errorf("failed to get items from cms: %w", err)
	}

	m := make(map[string]*fetcherPlateauItem2)
	for _, i := range items.Items {
		item := cmsItemToFetcherPlateauItem2(&i)
		if item != nil {
			m[item.ID] = item
		}
	}

	return m, nil
}
