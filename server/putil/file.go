package putil

import (
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearthx/rerror"
)

func DeliverFile(g *echo.Group, path, contentType string) bool {
	s, err := os.Stat(path)
	if err != nil {
		return false
	}

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	g.GET(s.Name(), func(c echo.Context) error {
		f, err := os.Open(path)
		if err != nil {
			return rerror.ErrNotFound
		}

		defer f.Close()
		return c.Stream(200, contentType, f)
	}, middleware.CORS(), middleware.Gzip())

	return true
}
