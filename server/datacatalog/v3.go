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

	// GraphQL playground
	plateauapig.GET("/:pid/graphql", gqlPlaygroundHandler(conf.PlaygroundEndpoint, false))
	plateauapig.GET("/graphql", gqlPlaygroundHandler(conf.PlaygroundEndpoint, false))
	plateauapig.GET("/admin/graphql", gqlPlaygroundHandler(conf.PlaygroundEndpoint, true))
	plateauapig.GET("/:pid/admin/graphql", gqlPlaygroundHandler(conf.PlaygroundEndpoint, true))

	// GraphQL API
	plateauapig.POST("/graphql", h.Handler(false))
	plateauapig.POST("/:pid/graphql", h.Handler(false))
	plateauapig.POST("/admin/graphql", h.Handler(true))
	plateauapig.POST("/:pid/admin/graphql", h.Handler(true))

	// CityGML files API
	plateauapig.GET("/citygml/:citygmlid", h.CityGMLFiles(false))
	plateauapig.GET("/:pid/citygml/:citygmlid", h.CityGMLFiles(false))
	plateauapig.GET("/admin/citygml/:citygmlid", h.CityGMLFiles(true))
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

		endpoint := path.Join(p...)
		if isAlpha(c) {
			endpoint += "?alpha=true"
		}

		h := plateauapi.PlaygroundHandler(
			"PLATEAU GraphQL API Playground",
			endpoint,
		)
		h.ServeHTTP(c.Response(), c.Request())
		return nil
	}
}
