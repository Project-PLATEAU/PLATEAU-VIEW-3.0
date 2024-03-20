package sdkapiv3

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearthx/log"
)

type Config struct {
	DataCatagloAPIURL   string
	DataCatalogAPIToken string
	Token               string
}

func Handler(conf Config, g *echo.Group) (bool, error) {
	if conf.DataCatagloAPIURL == "" {
		return false, nil
	}

	client, err := NewAPIClient(conf)
	if err != nil {
		return false, fmt.Errorf("error creating client: %w", err)
	}

	g.Use(
		auth(conf.Token),
		middleware.Gzip(),
	)

	g.GET("/datasets", func(c echo.Context) error {
		ctx := c.Request().Context()
		res, err := client.QueryDatasets(ctx)
		if err != nil {
			log.Errorfc(ctx, "sdkapiv3: error querying datasets: %v", err)
			return c.JSON(http.StatusBadGateway, map[string]any{"error": "bad gateway"})
		}

		res2 := res.ToDatasets()
		if res2 == nil {
			return c.JSON(http.StatusNotFound, map[string]any{"error": "not found"})
		}

		return c.JSON(http.StatusOK, res2)
	})

	g.GET("/datasets/:id/files", func(c echo.Context) error {
		id := c.Param("id")
		ctx := c.Request().Context()
		res, err := client.QueryDatasetFiles(ctx, id)
		if err != nil {
			log.Errorfc(ctx, "sdkapiv3: error querying dataset files: %v", err)
			return c.JSON(http.StatusBadGateway, map[string]any{"error": "bad gateway"})
		}

		if res == nil {
			return c.JSON(http.StatusNotFound, map[string]any{"error": "not found"})
		}

		return c.JSON(http.StatusOK, res)
	})

	log.Infof("sdkapiv3: initialized")
	return true, nil
}

func auth(expected string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if expected != "" {
				token := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
				if token != expected {
					return echo.ErrUnauthorized
				}
			}

			return next(c)
		}
	}
}
