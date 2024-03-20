package sidebar

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

const (
	shareCMSModel        = "share"
	shareCMSDataFieldKey = "data"
)

func ShareEcho(g *echo.Group, c Config) error {
	if c.DisableShare {
		return nil
	}

	h, err := NewHandler(c)
	if err != nil {
		return err
	}

	g.Use(
		middleware.CORS(),
		middleware.BodyLimit("10M"),
		h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
			Key: "pid",
		}),
	)

	g.GET("/:pid/:id", h.GetShare())
	g.POST("/:pid", h.CreateShare())
	return nil
}

func (s *Handler) GetShare() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		res, err := cmsh.GetItem(c.Request().Context(), c.Param("id"), false)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}

			return rerror.ErrInternalBy(fmt.Errorf("share: failed to get an item: %v", err))
		}

		f := res.FieldByKey(shareCMSDataFieldKey)
		if f == nil {
			log.Errorfc(ctx, "share: item got, but field %s does not contain: %+v", shareCMSDataFieldKey, res)
			return rerror.ErrNotFound
		}

		v, ok := f.Value.(string)
		if !ok {
			log.Errorfc(ctx, "share: item got, but field %s's value is not a string: %+v", shareCMSDataFieldKey, res)
			return rerror.ErrNotFound
		}

		return c.Blob(http.StatusOK, "application/json", []byte(v))
	}
}

func (s *Handler) CreateShare() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}

		cmsh := plateaucms.GetCMSFromContext(ctx)

		body, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return c.JSON(http.StatusUnprocessableEntity, "failed to read body")
		}

		if !json.Valid(body) {
			return c.JSON(http.StatusBadRequest, "invalid json")
		}

		res, err := cmsh.CreateItemByKey(c.Request().Context(), md.ProjectAlias, shareCMSModel, []*cms.Field{
			{Key: shareCMSDataFieldKey, Type: "textarea", Value: string(body)},
		}, nil)

		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return rerror.ErrNotFound
			}

			return rerror.ErrInternalBy(fmt.Errorf("share: failed to create an item: %v", err))
		}

		return c.JSON(http.StatusOK, res.ID)
	}
}
