package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ViewLoader struct {
	usecase interfaces.View
}

func NewViewLoader(usecase interfaces.View) *ViewLoader {
	return &ViewLoader{usecase: usecase}
}

func (c *ViewLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.View, []error) {
	sIds, err := util.TryMap(ids, gqlmodel.ToID[id.View])
	if err != nil {
		return nil, []error{err}
	}

	op := getOperator(ctx)

	res, err := c.usecase.FindByIDs(ctx, sIds, op)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(res, func(m *view.View, _ int) *gqlmodel.View {
		return gqlmodel.ToView(m)
	}), nil
}

func (c *ViewLoader) FindByModel(ctx context.Context, modelID gqlmodel.ID) ([]*gqlmodel.View, error) {
	mID, err := gqlmodel.ToID[id.Model](modelID)
	if err != nil {
		return nil, err
	}

	op := getOperator(ctx)

	res, err := c.usecase.FindByModel(ctx, mID, op)
	if err != nil {
		return nil, err
	}
	integrations := make([]*gqlmodel.View, 0, len(res))
	for _, i := range res {
		integrations = append(integrations, gqlmodel.ToView(i))
	}
	return integrations, nil
}

// data loaders

type ViewDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.View, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.View, []error)
}

func (c *ViewLoader) DataLoader(ctx context.Context) ViewDataLoader {
	return gqldataloader.NewViewLoader(gqldataloader.ViewLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.View, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *ViewLoader) OrdinaryDataLoader(ctx context.Context) ViewDataLoader {
	return &ordinaryViewLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.View, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryViewLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.View, []error)
}

func (l *ordinaryViewLoader) Load(key gqlmodel.ID) (*gqlmodel.View, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryViewLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.View, []error) {
	return l.fetch(keys)
}
