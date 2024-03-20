package datacatalog

import (
	"context"
	"path"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/plateauapi"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func echov3(conf Config, g *echo.Group) (func(ctx context.Context) error, error) {
	h, err := newReposHandler(conf)
	if err != nil {
		return nil, err
	}

	// PLATEAU API
	plateauapig := g.Group("")
	plateauapig.Use(
		middleware.CORS(),
		middleware.Gzip(),
		h.Middleware(),
	)

	// GraphQL playground (all)
	plateauapig.GET("/graphql", gqlPlaygroundHandler(conf.PlaygroundEndpoint, false))

	// CityGML files API
	plateauapig.GET("/citygml/:citygmlid", h.CityGMLFiles(false))

	// GraphQL playground (all, admin)
	plateauapig.GET("/admin/graphql", gqlPlaygroundHandler(conf.PlaygroundEndpoint, true))

	// CityGML files API (admin)
	plateauapig.GET("/admin/citygml/:citygmlid", h.CityGMLFiles(true))

	// GraphQL playground (project)
	plateauapig.GET("/:pid/graphql", gqlPlaygroundHandler(conf.PlaygroundEndpoint, false))

	// GraphQL playground (project, admin)
	plateauapig.GET("/:pid/admin/graphql", gqlPlaygroundHandler(conf.PlaygroundEndpoint, true))

	// GraphQL API (all)
	plateauapig.POST("/graphql", h.Handler(false))

	// GraphQL API (all, admin)
	plateauapig.POST("/admin/graphql", h.Handler(true))

	// GraphQL API (project)
	plateauapig.POST("/:pid/graphql", h.Handler(false))

	// CityGML files API
	plateauapig.GET("/:pid/citygml/:citygmlid", h.CityGMLFiles(false))

	// GraphQL API (project, admin)
	plateauapig.POST("/:pid/admin/graphql", h.Handler(true))

	// CityGML files API (admin)
	plateauapig.GET("/:pid/admin/citygml/:citygmlid", h.CityGMLFiles(true))

	// warning API
	plateauapig.GET("/:pid/warnings", h.WarningHandler)

	// cache update API
	g.POST("/update-cache", h.UpdateCacheHandler)

	return func(ctx context.Context) error {
		return h.Init(ctx)
	}, nil
}

func gqlPlaygroundHandler(endpoint string, admin bool) echo.HandlerFunc {
	return func(c echo.Context) error {
		pid := c.Param(pidParamName)

		p := make([]string, 0, 4)
		p = append(p, endpoint)
		if pid != "" {
			p = append(p, pid)
		}
		if admin {
			p = append(p, "admin")
		}
		p = append(p, "graphql")

		h := plateauapi.PlaygroundHandler(
			"PLATEAU GraphQL API Playground",
			path.Join(p...),
		)
		h.ServeHTTP(c.Response(), c.Request())
		return nil
	}
}
