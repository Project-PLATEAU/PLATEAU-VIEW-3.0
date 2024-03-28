package datacatalogv2

import (
	"net/http"
	"time"

	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/eukarya-inc/reearth-plateauview/server/putil"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearthx/log"
)

type Config struct {
	plateaucms.Config
	DisableCache bool
	CacheTTL     int
}

func Echo(conf Config, g *echo.Group) error {
	pcms, err := plateaucms.New(conf.Config)
	if err != nil {
		return err
	}

	f, err := NewFetcher(conf.Config.CMSBaseURL)
	if err != nil {
		return err
	}

	g.Use(
		middleware.CORS(),
		middleware.Gzip(),
		putil.NewCacheMiddleware(putil.CacheConfig{
			Disabled:     conf.DisableCache,
			TTL:          time.Duration(conf.CacheTTL) * time.Second,
			CacheControl: true,
		}).Middleware(),
		pcms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
			Key:             "pid",
			FindDataCatalog: true,
		}),
	)

	g.GET("/:pid", func(c echo.Context) error {
		ctx := c.Request().Context()

		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.DataCatalogProjectAlias == "" || md.DataCatalogSchemaVersion != "" && md.DataCatalogSchemaVersion != "v2" {
			return c.JSON(http.StatusNotFound, "not found")
		}

		opts := FetcherDoOptions{}
		if md.Name == "" {
			// plateau project
			opts.HideUsacaseCityAndWard = true
		} else {
			// other project
			opts.Subproject = md.SubPorjectAlias
			opts.CityName = md.Name
		}

		res, err := f.Do(ctx, md.DataCatalogProjectAlias, opts)
		if err != nil {
			log.Errorfc(ctx, "datacatalog: %v", err)
			return c.JSON(http.StatusInternalServerError, "error")
		}
		return c.JSON(http.StatusOK, res.All())
	})

	return nil
}
