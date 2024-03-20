package app

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/adapter/publicapi"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
)

func UsecaseMiddleware(r *repo.Container, g *gateway.Container, ar *accountrepo.Container, ag *accountgateway.Container, config interactor.ContainerConfig) echo.MiddlewareFunc {
	return ContextMiddleware(func(ctx context.Context) context.Context {
		var r2 *repo.Container
		var ar2 *accountrepo.Container
		if op := adapter.Operator(ctx); op != nil && r != nil {
			// apply filters to repos
			r2 = r.Filtered(repo.WorkspaceFilterFromOperator(op), repo.ProjectFilterFromOperator(op))
			ar2 = ar.Filtered(accountrepo.WorkspaceFilterFromOperator(op.AcOperator))

		} else {
			r2 = r
			ar2 = ar
		}

		uc := interactor.New(r2, g, ar2, ag, config)
		ctx = adapter.AttachUsecases(ctx, &uc)
		ctx = publicapi.AttachController(ctx, publicapi.NewController(r2.Project, &uc, g.File.GetURL))
		return ctx
	})
}

func ContextMiddleware(fn func(ctx context.Context) context.Context) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			c.SetRequest(req.WithContext(fn(req.Context())))
			return next(c)
		}
	}
}
