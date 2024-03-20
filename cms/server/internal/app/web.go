package app

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/spf13/afero"
)

func Web(e *echo.Echo, config map[string]any, disabled bool, fs afero.Fs) {
	if disabled {
		return
	}

	if fs == nil {
		fs = afero.NewOsFs()
	}
	if _, err := fs.Stat("web"); err != nil {
		return // web won't be delivered
	}

	e.Logger.Info("web: web directory will be delivered\n")

	e.GET("/reearth_config.json", func(c echo.Context) error {
		return c.JSON(http.StatusOK, config)
	})

	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:       "web",
		Index:      "index.html",
		Browse:     false,
		HTML5:      true,
		Filesystem: afero.NewHttpFs(fs),
	}))
}
