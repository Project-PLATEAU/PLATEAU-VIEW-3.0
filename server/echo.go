package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
)

func cmsWebhookHandler(g *echo.Group, secret []byte, handlers []cmswebhook.Handler) {
	m := echo.WrapMiddleware(cmswebhook.Middleware(cmswebhook.MiddlewareConfig{
		Secret: secret,
		Logger: log.Debugfc,
	}))

	g.POST("", func(c echo.Context) error {
		w := cmswebhook.GetPayload(c.Request().Context())
		if w == nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		}

		if err := c.JSON(http.StatusOK, "ok"); err != nil {
			return err
		}

		for _, h := range handlers {
			if err := h(c.Request(), w); err != nil {
				return err
			}
		}

		return nil
	}, m)
}
