package sidebar

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

const (
	dataModelKey      = "sidebar-data"
	templateModelKey  = "sidebar-template"
	dataField         = "data"
	tokenProject      = "system"
	tokenModel        = "workspaces"
	tokenProjectField = "project_alias"
	limit             = 10
)

var authMethods = plateaucms.HTTPMethodsExceptGET

func Echo(g *echo.Group, c Config) error {
	h, err := NewHandler(c)
	if err != nil {
		return err
	}

	g.Use(
		middleware.CORS(),
		middleware.BodyLimit("5M"),
		h.cms.AuthMiddleware(plateaucms.AuthMiddlewareConfig{
			Key:         "pid",
			AuthMethods: authMethods,
		}),
	)

	g.GET("/:pid", h.fetchRoot())
	g.GET("/:pid/data", h.getAllDataHandler())
	g.GET("/:pid/data/:iid", h.getDataHandler())
	g.POST("/:pid/data", h.createDataHandler())
	g.PATCH("/:pid/data/:iid", h.updateDataHandler())
	g.DELETE("/:pid/data/:iid", h.deleteDataHandler())
	g.GET("/:pid/templates", h.fetchTemplatesHandler())
	g.GET("/:pid/templates/:tid", h.fetchTemplateHandler())
	g.POST("/:pid/templates", h.createTemplateHandler())
	g.PATCH("/:pid/templates/:tid", h.updateTemplateHandler())
	g.DELETE("/:pid/templates/:tid", h.deleteTemplateHandler())

	return nil
}

// GET /:pid
func (h *Handler) fetchRoot() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		c.Response().Header().Set(echo.HeaderCacheControl, "no-cache, must-revalidate")

		if hit, err := h.cms.LastModified(c, md.ProjectAlias, dataModelKey, templateModelKey); err != nil {
			return err
		} else if hit {
			return nil
		}

		dataCh := make(chan []cms.Item, 1)
		dataErrCh := make(chan error, 1)
		templatesCh := make(chan []cms.Item, 1)
		templateErrCh := make(chan error, 1)

		go func() {
			data, err := cmsh.GetItemsByKeyInParallel(ctx, md.ProjectAlias, dataModelKey, false, limit)
			if err != nil {
				dataErrCh <- err
				return
			}
			if data == nil {
				dataCh <- nil
			} else {
				dataCh <- data.Items
			}
			close(dataErrCh)
		}()

		go func() {
			templates, err := cmsh.GetItemsByKeyInParallel(ctx, md.ProjectAlias, templateModelKey, false, limit)
			if err != nil {
				templateErrCh <- err
				return
			}
			if templates == nil {
				templatesCh <- nil
			} else {
				templatesCh <- templates.Items
			}
			close(templateErrCh)
		}()

		err := <-dataErrCh
		if err == nil {
			err = <-templateErrCh
		}
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		return c.JSON(http.StatusOK, map[string]any{
			"data":      itemsToJSONs(<-dataCh),
			"templates": itemsToJSONs(<-templatesCh),
		})
	}
}

// GET /:pid/data
func (h *Handler) getAllDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		c.Response().Header().Set(echo.HeaderCacheControl, "no-cache, must-revalidate")

		if hit, err := h.cms.LastModified(c, md.ProjectAlias, dataModelKey); err != nil {
			return err
		} else if hit {
			return nil
		}

		data, err := cmsh.GetItemsByKeyInParallel(ctx, md.ProjectAlias, dataModelKey, false, limit)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		if data == nil {
			return c.JSON(http.StatusOK, itemsToJSONs(nil))
		}
		return c.JSON(http.StatusOK, itemsToJSONs(data.Items))
	}
}

// GET /:pid/data/:iid
func (h *Handler) getDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		itemID := c.Param("iid")
		if itemID == "" {
			return c.JSON(http.StatusNotFound, nil)
		}

		c.Response().Header().Set(echo.HeaderCacheControl, "no-cache, must-revalidate")

		item, err := cmsh.GetItem(ctx, itemID, false)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(item.FieldByKey(dataField), item.ID)
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// POST /:pid/data
func (h *Handler) createDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		b, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		if !json.Valid(b) {
			return errors.New("invalid json")
		}

		fields := []*cms.Field{{
			Key:   dataField,
			Value: string(b),
		}}
		item, err := cmsh.CreateItemByKey(ctx, md.ProjectAlias, dataModelKey, fields, nil)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(item.FieldByKey(dataField), item.ID)
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// PATCH /:pid/data/:did
func (h *Handler) updateDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		itemID := c.Param("iid")
		b, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		if !json.Valid(b) {
			return errors.New("invalid json")
		}

		fields := []*cms.Field{{
			Key:   dataField,
			Value: string(b),
		}}

		item, err := cmsh.UpdateItem(ctx, itemID, fields, nil)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(item.FieldByKey(dataField), item.ID)
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// DELETE /:pid/data/:did
func (h *Handler) deleteDataHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		itemID := c.Param("iid")

		if err := cmsh.DeleteItem(ctx, itemID); err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		return c.NoContent(http.StatusNoContent)
	}
}

// GET /:pid/templates
func (h *Handler) fetchTemplatesHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		c.Response().Header().Set(echo.HeaderCacheControl, "no-cache, must-revalidate")

		if hit, err := h.cms.LastModified(c, md.ProjectAlias, templateModelKey); err != nil {
			return err
		} else if hit {
			return nil
		}

		res, err := cmsh.GetItemsByKeyInParallel(ctx, md.ProjectAlias, templateModelKey, false, limit)
		if err != nil || res == nil {
			if errors.Is(err, cms.ErrNotFound) || res == nil {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		return c.JSON(http.StatusOK, itemsToJSONs(res.Items))
	}
}

// GET /:pid/templates/:tid
func (h *Handler) fetchTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		templateID := c.Param("tid")
		template, err := cmsh.GetItem(ctx, templateID, false)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(template.FieldByKey(dataField), template.ID)
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// POST /:pid/templates
func (h *Handler) createTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		b, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		if !json.Valid(b) {
			return errors.New("invalid json")
		}

		fields := []*cms.Field{{
			Key:   dataField,
			Value: string(b),
		}}

		template, err := cmsh.CreateItemByKey(ctx, md.ProjectAlias, templateModelKey, fields, nil)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(template.FieldByKey(dataField), template.ID)
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// PATCH /:pid/templates/:tid
func (h *Handler) updateTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		templateID := c.Param("tid")
		b, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		if !json.Valid(b) {
			return errors.New("invalid json")
		}

		fields := []*cms.Field{{
			Key:   dataField,
			Value: string(b),
		}}

		template, err := cmsh.UpdateItem(ctx, templateID, fields, nil)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		res := itemJSON(template.FieldByKey(dataField), template.ID)
		if res == nil {
			return c.JSON(http.StatusNotFound, "not found")
		}

		return c.JSON(http.StatusOK, res)
	}
}

// DELETE /:pid/templates/:tid
func (h *Handler) deleteTemplateHandler() func(c echo.Context) error {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		md := plateaucms.GetCMSMetadataFromContext(ctx)
		if md.ProjectAlias == "" {
			return rerror.ErrNotFound
		}
		cmsh := plateaucms.GetCMSFromContext(ctx)
		if cmsh == nil {
			return rerror.ErrNotFound
		}

		templateID := c.Param("tid")

		if err := cmsh.DeleteItem(ctx, templateID); err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "not found")
			}
			return err
		}

		return c.NoContent(http.StatusNoContent)
	}
}

func itemsToJSONs(items []cms.Item) []any {
	return lo.FilterMap(items, func(i cms.Item, _ int) (any, bool) {
		j := itemJSON(i.FieldByKey(dataField), i.ID)
		return j, j != nil
	})
}

func itemJSON(f *cms.Field, id string) any {
	var j any
	err := f.GetValue().JSON(&j)
	if j == nil || err != nil {
		return nil
	}
	if f.ID != "" {
		if o, ok := j.(map[string]any); ok {
			o["id"] = id
			return o
		}
	}
	return j
}
