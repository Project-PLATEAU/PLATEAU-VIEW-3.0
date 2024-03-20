package publicapi

import (
	"context"
	"errors"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func (c *Controller) GetItem(ctx context.Context, prj, mkey, i string) (Item, error) {
	pr, err := c.checkProject(ctx, prj)
	if err != nil {
		return Item{}, err
	}

	if mkey == "" {
		return Item{}, rerror.ErrNotFound
	}

	iid, err := id.ItemIDFrom(i)
	if err != nil {
		return Item{}, rerror.ErrNotFound
	}

	it, err := c.usecases.Item.FindPublicByID(ctx, iid, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return Item{}, rerror.ErrNotFound
		}
		return Item{}, err
	}

	itv := it.Value()
	m, err := c.usecases.Model.FindByID(ctx, itv.Model(), nil)
	if err != nil {
		return Item{}, err
	}

	if m.Key().String() != mkey || !m.Public() {
		return Item{}, rerror.ErrNotFound
	}

	sp, err := c.usecases.Schema.FindByModel(ctx, m.ID(), nil)
	if err != nil {
		return Item{}, err
	}

	var assets asset.List
	if pr.Publication().AssetPublic() {
		assets, err = c.usecases.Asset.FindByIDs(ctx, itv.AssetIDs(), nil)
		if err != nil {
			return Item{}, err
		}
	}

	return NewItem(itv, sp, assets, c.assetUrlResolver, getReferencedItems(ctx, itv, pr.Publication().AssetPublic(), c.assetUrlResolver)), nil
}

func (c *Controller) GetItems(ctx context.Context, prj, model string, p ListParam) (ListResult[Item], *schema.Schema, error) {
	pr, err := c.checkProject(ctx, prj)
	if err != nil {
		return ListResult[Item]{}, nil, err
	}

	m, err := c.usecases.Model.FindByKey(ctx, pr.ID(), model, nil)
	if err != nil {
		return ListResult[Item]{}, nil, err
	}
	if !m.Public() {
		return ListResult[Item]{}, nil, rerror.ErrNotFound
	}

	sp, err := c.usecases.Schema.FindByModel(ctx, m.ID(), nil)
	if err != nil {
		return ListResult[Item]{}, nil, err
	}

	items, pi, err := c.usecases.Item.FindPublicByModel(ctx, m.ID(), p.Pagination, nil)
	if err != nil {
		return ListResult[Item]{}, nil, err
	}

	var assets asset.List
	if pr.Publication().AssetPublic() {
		assetIDs := lo.FlatMap(items.Unwrap(), func(i *item.Item, _ int) []id.AssetID {
			return i.AssetIDs()
		})
		assets, err = c.usecases.Asset.FindByIDs(ctx, assetIDs, nil)
		if err != nil {
			return ListResult[Item]{}, nil, err
		}
	}

	itms, err := util.TryMap(items.Unwrap(), func(i *item.Item) (Item, error) {

		if err != nil {
			return Item{}, err
		}
		return NewItem(i, sp, assets, c.assetUrlResolver, getReferencedItems(ctx, i, pr.Publication().AssetPublic(), c.assetUrlResolver)), nil
	})
	if err != nil {
		return ListResult[Item]{}, nil, err
	}

	res := NewListResult(itms, pi, p.Pagination)
	return res, sp.Schema(), nil
}

func getReferencedItems(ctx context.Context, i *item.Item, prp bool, urlResolver asset.URLResolver) []Item {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if i == nil {
		return nil
	}

	var vi []Item
	for _, f := range i.Fields() {
		if f.Type() != value.TypeReference {
			continue
		}
		for _, v := range f.Value().Values() {
			iid, ok := v.Value().(id.ItemID)
			if !ok {
				continue
			}
			ii, err := uc.Item.FindByID(ctx, iid, op)
			if err != nil || ii == nil {
				continue
			}
			sp, err := uc.Schema.FindByModel(ctx, ii.Value().Model(), op)
			if err != nil {
				continue
			}
			var assets asset.List
			if prp {
				assets, err = uc.Asset.FindByIDs(ctx, ii.Value().AssetIDs(), nil)
				if err != nil {
					continue
				}
			}
			vi = append(vi, NewItem(ii.Value(), sp, assets, urlResolver, nil))
		}
	}

	return vi
}
