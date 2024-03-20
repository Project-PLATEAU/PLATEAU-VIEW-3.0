package sdkapiv2

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
	"unicode"

	"github.com/eukarya-inc/reearth-plateauview/server/putil"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
)

func Handler(conf Config, g *echo.Group) (bool, error) {
	conf.Default()

	if conf.CMSBaseURL == "" || conf.Project == "" {
		return false, nil
	}

	icl, err := cms.New(conf.CMSBaseURL, conf.CMSToken)
	if err != nil {
		return false, err
	}

	// cl, err := cms.NewPublicAPIClient[Item](nil, conf.CMSBaseURL)
	// if err != nil {
	// 	return false, err
	// }

	cms := NewCMS(icl, nil, conf.Project, false)

	log.Infof("sdkapiv2: initialized")
	return true, handler(conf, g, cms)
}

func handler(conf Config, g *echo.Group, cms *CMS) error {
	conf.Default()

	cache := putil.NewCacheMiddleware(putil.CacheConfig{
		Disabled: conf.DisableCache,
		TTL:      time.Duration(conf.CacheTTL) * time.Second,
	}).Middleware()

	g.Use(
		auth(conf.Token),
		middleware.Gzip(),
	)

	g.GET("/datasets", func(c echo.Context) error {
		if hit, err := lastModified(c, cms, conf.Model); err != nil {
			return err
		} else if hit {
			return nil
		}

		data, err := cms.Datasets(c.Request().Context(), conf.Model)
		if err != nil {
			return err
		}
		return c.JSON(http.StatusOK, data)
	}, cache)

	g.GET("/datasets/:id/files", func(c echo.Context) error {
		data, err := cms.Files(c.Request().Context(), conf.Model, c.Param("id"))
		if err != nil {
			return err
		}
		return c.JSON(http.StatusOK, data)
	})

	return nil
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

func getMaxLOD(ctx context.Context, u string) (MaxLODColumns, error) {
	log.Debugfc(ctx, "sdkapi: fetch max lod: %s", u)

	req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
	if err != nil {
		return nil, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer func() {
		_ = res.Body.Close()
	}()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid status code: %d", res.StatusCode)
	}

	return ReadMaxLODCSV(res.Body)
}

func isInt(s string) bool {
	for _, c := range s {
		if !unicode.IsDigit(c) {
			return false
		}
	}
	return true
}

func lastModified(c echo.Context, cmsc *CMS, prj string, models ...string) (bool, error) {
	if cmsc == nil || cmsc.IntegrationAPIClient == nil {
		return false, nil
	}

	mlastModified := time.Time{}

	for _, m := range models {
		model, err := cmsc.IntegrationAPIClient.GetModelByKey(c.Request().Context(), prj, m)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return false, c.JSON(http.StatusNotFound, "not found")
			}
			return false, err
		}

		if model != nil && mlastModified.Before(model.LastModified) {
			mlastModified = model.LastModified
		}
	}

	return putil.LastModified(c, mlastModified)
}
