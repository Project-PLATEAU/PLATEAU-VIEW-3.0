package geospatialjpv2

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/rerror"
)

func Handler(conf Config) (echo.HandlerFunc, error) {
	s, err := NewServices(conf)
	if err != nil {
		return nil, err
	}

	return func(c echo.Context) error {
		if conf.DisablePublication || conf.PublicationToken == "" {
			return rerror.ErrNotFound
		}

		token := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
		if conf.PublicationToken != token {
			return c.JSON(http.StatusUnauthorized, "unauthorized")
		}

		b := struct {
			ID                    string `json:"id"`
			DisableSDKPublication bool   `json:"disable_sdk_publication,omitempty"`
		}{}
		if err := c.Bind(&b); err != nil {
			return c.JSON(http.StatusBadRequest, "invalid body")
		}

		itemID := b.ID
		if itemID == "" {
			return rerror.ErrNotFound
		}

		ctx := c.Request().Context()
		item, err := s.CMS.GetItem(ctx, itemID, false)
		if err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				return c.JSON(http.StatusNotFound, "見つかりませんでした。")
			}
			return rerror.ErrInternalBy(err)
		}

		gitem := ItemFrom(*item)
		err = s.RegisterCkanResources(ctx, gitem, b.DisableSDKPublication)

		if err != nil {
			comment := fmt.Sprintf("G空間情報センターへの登録処理でエラーが発生しました。%v", err)
			s.commentToItem(ctx, itemID, comment)
			return c.JSON(http.StatusBadRequest, map[string]any{"error": err.Error()})
		}

		s.commentToItem(ctx, itemID, "G空間情報センターへの登録が完了しました")
		return c.JSON(http.StatusOK, "ok")
	}, nil
}
