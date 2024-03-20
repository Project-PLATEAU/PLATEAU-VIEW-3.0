package cmsintegrationv2

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
	"github.com/spkg/bom"
)

func NotifyHandler(conf Config) (echo.HandlerFunc, error) {
	s, err := NewServices(conf)
	if err != nil {
		return nil, err
	}

	return func(c echo.Context) error {
		ctx := c.Request().Context()

		var f fmeResult
		if err := c.Bind(&f); err != nil {
			log.Info("cmsintegration notify: invalid payload: %w", err)
			return c.JSON(http.StatusBadRequest, "invalid payload")
		}

		log.Infofc(ctx, "cmsintegration notify: received: %+v", f)

		if f.ResultURL != "" {
			if err := s.receiveMaxLODExtractionResult(ctx, f); err != nil {
				if errors.Is(err, ErrInvalidFMEID) {
					return c.JSON(http.StatusUnauthorized, "unauthorized")
				}
				log.Errorfc(ctx, "sdk notify: error: %v", err)
				return nil
			}
			return nil
		}

		id, err := parseFMEID(f.ID, conf.Secret)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, "unauthorized")
		}

		log.Errorfc(ctx, "cmsintegration notify: validate: itemID=%s, assetID=%s", id.ItemID, id.AssetID)

		if f.Status != "ok" && f.Status != "error" {
			return c.JSON(http.StatusBadRequest, fmt.Sprintf("invalid type: %s", f.Type))
		}

		if err := c.JSON(http.StatusOK, "ok"); err != nil {
			return err
		}

		cc := commentContent(f)
		if err := s.CMS.CommentToItem(ctx, id.ItemID, cc); err != nil {
			log.Errorfc(ctx, "cmsintegration notify: failed to comment: %v", err)
			return nil
		}

		if conf.Debug {
			if err := s.CMS.CommentToItem(ctx, id.ItemID, fmt.Sprintf("%+v", f.Results)); err != nil {
				log.Errorfc(ctx, "cmsintegration notify: failed to comment: %v", err)
			}
		}

		if f.Status == "error" {
			if _, err := s.CMS.UpdateItem(ctx, id.ItemID, Item{
				ConversionStatus:  StatusError,
				ConversionEnabled: ConversionDisabled,
			}.Fields(), nil); err != nil {
				log.Errorfc(ctx, "cmsintegration notify: failed to update item: %v", err)

				if conf.Debug {
					if err := s.CMS.CommentToItem(ctx, id.ItemID, fmt.Sprintf("debug: failed to update item 1: %v", err)); err != nil {
						log.Errorfc(ctx, "cmsintegration notify: failed to comment: %v", err)
					}
				}

				return nil
			}
			return nil
		}

		r, unknown, err := uploadAssets(ctx, s.CMS, id.ProjectID, f)
		if err != nil {
			log.Errorfc(ctx, "cmsintegration notify: failed to update assets: %v", err)
			// err is reported as a comment later
		}

		if len(unknown) > 0 {
			u := strings.Join(unknown, ",")
			log.Warnf("cmsintegration notify: unprocessed: %s", u)

			if conf.Debug {
				if err := s.CMS.CommentToItem(ctx, id.ItemID, fmt.Sprintf("debug: unprocessed keys: %v", err)); err != nil {
					log.Errorfc(ctx, "cmsintegration notify: failed to comment: %v", err)
				}
			}
		}

		if dicURL := f.GetDic(); dicURL != "" {
			if r.Dic, err = readDic(ctx, dicURL); err != nil {
				log.Errorfc(ctx, "cmsintegration: failed to read dic from %s: %v", dicURL, err)
			}
		}

		r.ConversionStatus = StatusOK
		if f := r.Fields(); len(f) > 0 {
			if _, err := s.CMS.UpdateItem(ctx, id.ItemID, f, nil); err != nil {
				log.Errorfc(ctx, "cmsintegration notify: failed to update item: %v", err)

				if conf.Debug {
					if err := s.CMS.CommentToItem(ctx, id.ItemID, fmt.Sprintf("debug: failed to upload item 3: %v", err)); err != nil {
						log.Errorfc(ctx, "cmsintegration notify: failed to comment: %v", err)
					}
				}

				return nil
			}
		}

		log.Infofc(ctx, "cmsintegration notify: done")

		comment := ""
		if err != nil {
			comment = fmt.Sprintf("変換結果アセットのアップロードと設定を行いましたが、一部でエラーが発生しました。 %v", err)
		} else {
			comment = "変換結果アセットのアップロードと設定が完了しました。"
		}
		if err := s.CMS.CommentToItem(ctx, id.ItemID, comment); err != nil {
			log.Errorfc(ctx, "cmsintegration notify: failed to comment: %v", err)
		}

		return nil
	}, nil
}

func commentContent(f fmeResult) string {
	var log string
	if f.LogURL != "" {
		log = fmt.Sprintf(" ログ: %s", f.LogURL)
	}

	var tt string
	if f.Type == "qualityCheck" {
		tt = "品質検査"
	} else if f.Type == "conversion" {
		tt = "3D Tiles への変換"
	}

	if f.Status == "ok" {
		return fmt.Sprintf("%sに成功しました。変換結果のアセットのアップロードを開始します。%s", tt, log)
	}

	return fmt.Sprintf("%sでエラーが発生しました。%s", tt, log)
}

const maxRetry = 3

func uploadAssets(ctx context.Context, c cms.Interface, pid string, f fmeResult) (Item, []string, error) {
	result := map[string][]string{}
	var errors []string
	res, unknown := f.GetResult()
	queue := queueFromResult(res)

	for {
		if len(queue) == 0 {
			break
		}
		e := queue[0]
		queue = queue[1:]
		if e.Retry > maxRetry {
			errors = append(errors, e.Value)
			continue
		}

		log.Infofc(ctx, "cmsintegration notify: uploading %s (%d/3): %s", e.Key, e.Retry, e.Value)

		assetID, err := c.UploadAsset(ctx, pid, e.Value)
		if err != nil {
			log.Errorfc(ctx, "cmsintegration notify: failed to upload asset %s (%d/3): %v", e.Key, e.Retry, err)
			e.Retry++
			e.Error = err
			queue = append(queue, e)
			continue
		}

		log.Infofc(ctx, "cmsintegration notify: asset uploaded %s: %s", e.Key, assetID)
		if _, ok := result[e.Key]; !ok {
			result[e.Key] = []string{}
		}
		result[e.Key] = append(result[e.Key], assetID)
	}

	var err error
	if len(errors) > 0 {
		err = fmt.Errorf("cms integration notify: failed to upload: %v", errors)
	}

	return itemFromUploadResult(result), unknown, err
}

type queue struct {
	Key   string
	Value string
	Retry int
	Error error
}

func queueFromResult(res fmeResultAssets) (q []queue) {
	for _, e := range res.Entries() {
		for _, v2 := range e.Value {
			q = append(q, queue{Key: e.Key, Value: v2})
		}
	}
	return
}

func itemFromUploadResult(r map[string][]string) (i Item) {
	for k, v := range r {
		switch k {
		case "bldg":
			i.Bldg = v
		case "tran":
			i.Tran = v
		case "fld":
			i.Fld = v
		case "tnm":
			i.Tnm = v
		case "htd":
			i.Htd = v
		case "ifld":
			i.Ifld = v
		case "urf":
			i.Urf = v
		case "frn":
			i.Frn = v
		case "veg":
			i.Veg = v
		case "lsld":
			i.Lsld = v
		case "luse":
			i.Luse = v
		case "all":
			if len(v) > 0 {
				i.All = v[0]
			}
		case "dictionary":
			if len(v) > 0 {
				i.Dictionary = v[0]
			}
		}
	}
	return
}

func readDic(ctx context.Context, u string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
	if err != nil {
		return "", err
	}
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer func() {
		_ = res.Body.Close()
	}()
	if res.StatusCode >= 300 {
		return "", fmt.Errorf("status code is %d", err)
	}
	s, err := io.ReadAll(bom.NewReader(res.Body))
	if err != nil {
		return "", err
	}
	return string(s), nil
}
