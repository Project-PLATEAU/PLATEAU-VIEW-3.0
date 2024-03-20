package interactor

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/rerror"
)

type View struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewView(r *repo.Container, g *gateway.Container) interfaces.View {
	return &View{
		repos:    r,
		gateways: g,
	}
}

func (i View) FindByID(ctx context.Context, ID view.ID, _ *usecase.Operator) (*view.View, error) {
	return i.repos.View.FindByID(ctx, ID)
}

func (i View) FindByIDs(ctx context.Context, IDs view.IDList, _ *usecase.Operator) (view.List, error) {
	return i.repos.View.FindByIDs(ctx, IDs)
}

func (i View) FindByModel(ctx context.Context, mID view.ModelID, _ *usecase.Operator) (view.List, error) {
	return i.repos.View.FindByModel(ctx, mID)
}

func (i View) Create(ctx context.Context, param interfaces.CreateViewParam, op *usecase.Operator) (*view.View, error) {
	if op.AcOperator.User == nil {
		return nil, interfaces.ErrInvalidOperator
	}
	return Run1(ctx, op, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ *view.View, err error) {
			if !op.IsMaintainingProject(param.Project) {
				return nil, interfaces.ErrOperationDenied
			}

			m, err := i.repos.Model.FindByID(ctx, param.Model)
			if err != nil {
				return nil, err
			}

			if m == nil || m.Project() != param.Project {
				return nil, rerror.ErrNotFound
			}

			v, err := view.
				New().
				NewID().
				Project(param.Project).
				Model(param.Model).
				Schema(m.Schema()).
				Name(param.Name).
				Sort(param.Sort).
				Filter(param.Filter).
				Columns(param.Columns).
				User(*op.Operator().User()).
				Build()

			if err != nil {
				return nil, err
			}

			err = i.repos.View.Save(ctx, v)
			if err != nil {
				return nil, err
			}
			return v, nil
		})
}

func (i View) Update(ctx context.Context, ID view.ID, param interfaces.UpdateViewParam, op *usecase.Operator) (*view.View, error) {
	return Run1(ctx, op, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ *view.View, err error) {
			v, err := i.repos.View.FindByID(ctx, ID)
			if err != nil {
				return nil, err
			}

			if !op.IsMaintainingProject(v.Project()) {
				return nil, interfaces.ErrOperationDenied
			}

			if param.Name != nil {
				v.SetName(*param.Name)
			}
			v.SetFilter(param.Filter)
			v.SetSort(param.Sort)
			v.SetColumns(param.Columns)
			v.SetUpdatedAt(time.Now())

			if err := i.repos.View.Save(ctx, v); err != nil {
				return nil, err
			}
			return v, nil
		})
}

func (i View) Delete(ctx context.Context, ID view.ID, op *usecase.Operator) error {
	return Run0(ctx, op, i.repos, Usecase().Transaction(),
		func(ctx context.Context) error {
			m, err := i.repos.View.FindByID(ctx, ID)
			if err != nil {
				return err
			}
			if !op.IsMaintainingProject(m.Project()) {
				return interfaces.ErrOperationDenied
			}

			views, err := i.repos.View.FindByModel(ctx, m.Model())
			if err != nil {
				return err
			}
			if len(views) <= 1 {
				return interfaces.ErrLastView
			}

			if err := i.repos.View.Remove(ctx, ID); err != nil {
				return err
			}
			return nil
		})
}
