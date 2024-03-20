package gql

import (
	"context"
	"errors"
	"github.com/reearth/reearthx/log"
	"go.opencensus.io/trace"
	"time"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ItemLoader struct {
	usecase       interfaces.Item
	schemaUsecase interfaces.Schema
	modelUsecase  interfaces.Model
}

func NewItemLoader(usecase interfaces.Item, schemaUsecase interfaces.Schema, modelUsecase interfaces.Model) *ItemLoader {
	return &ItemLoader{usecase: usecase, schemaUsecase: schemaUsecase, modelUsecase: modelUsecase}
}

func (c *ItemLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
	op := getOperator(ctx)
	if len(ids) == 0 {
		return nil, nil
	}
	iIds, err := util.TryMap(ids, gqlmodel.ToID[id.Item])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FindByIDs(ctx, iIds, op)
	if err != nil {
		return nil, []error{err}
	}

	sIds := lo.SliceToMap(res, func(v item.Versioned) (id.ItemID, id.SchemaID) {
		return v.Value().ID(), v.Value().Schema()
	})
	ss, gs, err := c.schemaUsecase.GetSchemasAndGroupSchemasByIDs(ctx, lo.Uniq(lo.Values(sIds)), op)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(res, func(m item.Versioned, i int) *gqlmodel.Item {
		s, _ := lo.Find(ss, func(s *schema.Schema) bool {
			return s.ID() == sIds[m.Value().ID()]
		})
		return gqlmodel.ToItem(m, s, gs)
	}), nil
}

func (c *ItemLoader) FindVersionedItem(ctx context.Context, itemID gqlmodel.ID) (*gqlmodel.VersionedItem, error) {
	op := getOperator(ctx)
	iId, err := gqlmodel.ToID[id.Item](itemID)
	if err != nil {
		return nil, err
	}

	itm, err := c.usecase.FindByID(ctx, iId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, nil
		}
		return nil, err
	}
	ss, gs, err := c.schemaUsecase.GetSchemasAndGroupSchemasByIDs(ctx, id.SchemaIDList{itm.Value().Schema()}, op)
	if err != nil {
		return nil, err
	}

	return gqlmodel.ToVersionedItem(itm, ss[0], gs), nil
}

func (c *ItemLoader) FindVersionedItems(ctx context.Context, itemID gqlmodel.ID) ([]*gqlmodel.VersionedItem, error) {
	op := getOperator(ctx)
	iId, err := gqlmodel.ToID[id.Item](itemID)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindAllVersionsByID(ctx, iId, op)
	if err != nil {
		return nil, err
	}

	ss, gs, err := c.schemaUsecase.GetSchemasAndGroupSchemasByIDs(ctx, id.SchemaIDList{res[0].Value().Schema()}, op)
	if err != nil {
		return nil, err
	}
	vis := make([]*gqlmodel.VersionedItem, 0, len(res))
	for _, t := range res {
		vis = append(vis, gqlmodel.ToVersionedItem(t, ss[0], gs))
	}
	return vis, nil
}

func (c *ItemLoader) FindByProject(ctx context.Context, projectID gqlmodel.ID, p *gqlmodel.Pagination) (*gqlmodel.ItemConnection, error) {
	op := getOperator(ctx)
	pid, err := gqlmodel.ToID[id.Project](projectID)
	if err != nil {
		return nil, err
	}

	res, pi, err := c.usecase.FindByProject(ctx, pid, p.Into(), op)
	if err != nil {
		return nil, err
	}

	sIds := lo.SliceToMap(res, func(v item.Versioned) (id.ItemID, id.SchemaID) {
		return v.Value().ID(), v.Value().Schema()
	})

	ss, err := c.schemaUsecase.FindByIDs(ctx, lo.Uniq(lo.Values(sIds)), op)
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.ItemEdge, 0, len(res))
	nodes := make([]*gqlmodel.Item, 0, len(res))
	for _, i := range res {
		s, _ := lo.Find(ss, func(s *schema.Schema) bool {
			return s.ID() == sIds[i.Value().ID()]
		})
		itm := gqlmodel.ToItem(i, s, nil)
		edges = append(edges, &gqlmodel.ItemEdge{
			Node:   itm,
			Cursor: usecasex.Cursor(itm.ID),
		})
		nodes = append(nodes, itm)
	}

	return &gqlmodel.ItemConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: int(pi.TotalCount),
	}, nil
}

func (c *ItemLoader) Search(ctx context.Context, query gqlmodel.SearchItemInput) (*gqlmodel.ItemConnection, error) {
	_, span := trace.StartSpan(ctx, "loader/item/search")
	t := time.Now()
	defer func() { span.End(); log.Infof("trace: loader/item/search %s", time.Since(t)) }()

	op := getOperator(ctx)
	q := gqlmodel.ToItemQuery(query)

	sp, err := c.schemaUsecase.FindByModel(ctx, q.Model(), op)
	if err != nil {
		return nil, err
	}

	res, pi, err := c.usecase.Search(ctx, *sp, q, query.Pagination.Into(), op)
	if err != nil {
		return nil, err
	}

	sIds := lo.SliceToMap(res, func(v item.Versioned) (id.ItemID, id.SchemaID) {
		return v.Value().ID(), v.Value().Schema()
	})

	ss, gs, err := c.schemaUsecase.GetSchemasAndGroupSchemasByIDs(ctx, lo.Uniq(lo.Values(sIds)), op)
	if err != nil {
		return nil, err
	}
	edges := make([]*gqlmodel.ItemEdge, 0, len(res))
	nodes := make([]*gqlmodel.Item, 0, len(res))
	for _, i := range res {
		s, _ := lo.Find(ss, func(s *schema.Schema) bool {
			return s.ID() == sIds[i.Value().ID()]
		})
		itm := gqlmodel.ToItem(i, s, gs)
		edges = append(edges, &gqlmodel.ItemEdge{
			Node:   itm,
			Cursor: usecasex.Cursor(itm.ID),
		})
		nodes = append(nodes, itm)
	}

	return &gqlmodel.ItemConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: int(pi.TotalCount),
	}, nil
}

func (c *ItemLoader) IsItemReferenced(ctx context.Context, itemID gqlmodel.ID, correspondingFieldID gqlmodel.ID) (bool, error) {
	op := getOperator(ctx)
	iid, err := gqlmodel.ToID[id.Item](itemID)
	if err != nil {
		return false, err
	}
	fid, err := gqlmodel.ToID[id.Field](correspondingFieldID)
	if err != nil {
		return false, err
	}

	return c.usecase.IsItemReferenced(ctx, iid, fid, op)
}

// data loader

type ItemDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Item, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Item, []error)
}

func (c *ItemLoader) DataLoader(ctx context.Context) ItemDataLoader {
	return gqldataloader.NewItemLoader(gqldataloader.ItemLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *ItemLoader) OrdinaryDataLoader(ctx context.Context) ItemDataLoader {
	return &ordinaryItemLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryItemLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error)
}

func (l *ordinaryItemLoader) Load(key gqlmodel.ID) (*gqlmodel.Item, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryItemLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
	return l.fetch(keys)
}
