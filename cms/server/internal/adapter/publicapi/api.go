package publicapi

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

var contextKey = struct{}{}

const defaultLimit = 50
const maxLimit = 100

func AttachController(ctx context.Context, c *Controller) context.Context {
	return context.WithValue(ctx, contextKey, c)
}

func GetController(ctx context.Context) *Controller {
	return ctx.Value(contextKey).(*Controller)
}

func Echo(e *echo.Group) {
	e.Use(middleware.CORS())
	e.GET("/:project/:model", PublicApiItemList())
	e.GET("/:project/:model/:item", PublicApiItemOrAsset())
}

func PublicApiItemOrAsset() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(c.Request().Context())

		p, m, i := c.Param("project"), c.Param("model"), c.Param("item")
		var res any
		var err error
		if m == "assets" {
			res, err = ctrl.GetAsset(ctx, p, i)
		} else {
			res, err = ctrl.GetItem(ctx, p, m, i)
		}

		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

func PublicApiItemList() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(ctx)

		p, err := listParamFromEchoContext(c)
		if err != nil {
			return c.JSON(http.StatusBadRequest, "invalid offset or limit")
		}

		resType := ""
		m := c.Param("model")
		if strings.Contains(m, ".") {
			m, resType, _ = strings.Cut(m, ".")
		}
		if resType != "csv" && resType != "json" {
			resType = "json"
		}

		res, s, err := ctrl.GetItems(ctx, c.Param("project"), m, p)
		if err != nil {
			return err
		}

		switch resType {
		case "csv":
			return toCSV(c, res, s)
		case "json":
			return c.JSON(http.StatusOK, res)
		default:
			return c.JSON(http.StatusOK, res)
		}
	}
}

func PublicApiAsset() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(c.Request().Context())

		res, err := ctrl.GetAsset(ctx, c.Param("project"), c.Param("asset"))
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

func listParamFromEchoContext(c echo.Context) (ListParam, error) {
	limit, _ := intParams(c, "limit", "perPage", "per_page", "page_size", "pageSize")
	if limit <= 0 {
		limit = defaultLimit
	} else if limit > 100 {
		limit = maxLimit
	}

	var offset int64 = 0
	var err error
	var p *usecasex.Pagination
	if startCursor := c.QueryParam("start_cursor"); startCursor != "" {
		p = usecasex.CursorPagination{
			First: lo.ToPtr(int64(limit)),
			After: (*usecasex.Cursor)(&startCursor),
		}.Wrap()
	} else {
		if offsets := c.QueryParam("offset"); offsets != "" {
			offset, err = strconv.ParseInt(offsets, 10, 64)
		} else if page := c.QueryParam("page"); page != "" {
			page2, err2 := strconv.ParseInt(page, 10, 64)
			if page2 <= 0 {
				page2 = 1
			}
			offset = (page2 - 1) * limit
			err = err2
		}

		p = usecasex.OffsetPagination{
			Offset: offset,
			Limit:  limit,
		}.Wrap()
	}

	return ListParam{
		Pagination: p,
	}, err
}

func intParams(c echo.Context, params ...string) (int64, bool) {
	for _, p := range params {
		if q := c.QueryParam(p); q != "" {
			if p, err := strconv.ParseInt(q, 10, 64); err == nil {
				return p, true
			}
		}
	}
	return 0, false
}

func toCSV(c echo.Context, l ListResult[Item], s *schema.Schema) error {
	pr, pw := io.Pipe()

	go func() {
		var err error
		defer func() {
			_ = pw.CloseWithError(err)
		}()

		w := csv.NewWriter(pw)
		keys := lo.Map(s.Fields(), func(f *schema.Field, _ int) string {
			return f.Key().String()
		})
		err = w.Write(append([]string{"id"}, keys...))
		if err != nil {
			log.Errorf("filed to write csv headers, err: %+v", err)
			return
		}

		for _, itm := range l.Results {
			values := []string{itm.ID}
			for _, k := range keys {
				// values = append(values, fmt.Sprintf("%v", itm.Fields[k]))
				var v []byte
				v, err = json.Marshal(itm.Fields[k])
				if err != nil {
					log.Errorf("filed to json marshal field value, err: %+v", err)
					return
				}
				values = append(values, fmt.Sprintf("%v", string(v)))
			}
			err = w.Write(values)
			if err != nil {
				log.Errorf("filed to write csv value, err: %+v", err)
				return
			}
		}
		w.Flush()
	}()

	return c.Stream(http.StatusOK, "text/csv", pr)
}
