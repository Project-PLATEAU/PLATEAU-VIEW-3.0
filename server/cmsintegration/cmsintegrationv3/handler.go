package cmsintegrationv3

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

func Handler(conf Config, g *echo.Group) error {
	s, err := NewServices(conf)
	if err != nil {
		return err
	}

	g.POST(fmeHandlerPath, func(c echo.Context) error {
		ctx := c.Request().Context()

		var f fmeResult
		if err := c.Bind(&f); err != nil {
			log.Infofc(ctx, "cmsintegrationv3 notify: invalid payload: %w", err)
			return c.JSON(http.StatusBadRequest, "invalid payload")
		}

		log.Infofc(ctx, "cmsintegrationv3 notify: received: %#v", f)

		if err := receiveResultFromFME(ctx, s, &conf, f); err != nil {
			log.Errorfc(ctx, "cmsintegrationv3 notify: failed to receive result from fme: %v", err)
			return c.JSON(http.StatusInternalServerError, "failed to receive result from fme")
		}

		return nil
	})

	g.POST("/setup_cities", func(c echo.Context) error {
		if c.Request().Header.Get("Authorization") != "Bearer "+conf.APIToken {
			return c.JSON(http.StatusUnauthorized, "invalid token")
		}

		ctx := c.Request().Context()

		var i SetupCityItemsInput
		if err := c.Bind(&i); err != nil {
			log.Debugfc(ctx, "cmsintegrationv3 setup_cities: invalid payload: %w", err)
			return c.JSON(http.StatusBadRequest, "invalid payload")
		}

		log.Infofc(ctx, "cmsintegrationv3 setup_cities: received: %#v", i)

		if err := SetupCityItems(ctx, s, i, nil); err != nil {
			log.Errorfc(ctx, "cmsintegrationv3 setup_cities: %v", err)
			return c.JSON(http.StatusBadRequest, err.Error())
		}

		return c.JSON(http.StatusOK, "ok")
	})

	return nil
}
