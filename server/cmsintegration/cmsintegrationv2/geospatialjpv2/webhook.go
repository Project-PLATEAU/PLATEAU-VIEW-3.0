package geospatialjpv2

import (
	"fmt"
	"net/http"

	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
)

var (
	modelKey            = "plateau"
	gspatialjpTokyo23ku = "tokyo23ku"
	citygmlTokyo23ku    = "tokyo23-ku"
	citygmlTokyo23ku2   = "tokyo-23ku"
)

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	if conf.DisableCatalogCheck && conf.DisablePublication {
		return nil, nil
	}

	s, err := NewServices(conf)
	if err != nil {
		return nil, err
	}

	return func(req *http.Request, w *cmswebhook.Payload) error {
		ctx := req.Context()

		if !w.Operator.IsUser() && w.Operator.IsIntegrationBy(conf.CMSIntegration) {
			log.Debugfc(ctx, "geospatialjp webhook: invalid event operator: %+v", w.Operator)
			return nil
		}

		if w.Type != cmswebhook.EventItemCreate && w.Type != cmswebhook.EventItemUpdate && w.Type != cmswebhook.EventItemPublish {
			log.Debugfc(ctx, "geospatialjp webhook: invalid event type: %s", w.Type)
			return nil
		}

		if w.ItemData == nil || w.ItemData.Item == nil || w.ItemData.Model == nil {
			log.Debugfc(ctx, "geospatialjp webhook: invalid event data: %+v", w.Data)
			return nil
		}

		if w.ItemData.Model.Key != modelKey {
			log.Debugfc(ctx, "geospatialjp webhook: invalid model id: %s, key: %s", w.ItemData.Item.ModelID, w.ItemData.Model.Key)
			return nil
		}

		item := ItemFrom(*w.ItemData.Item)

		var err error
		var act string
		if w.Type == cmswebhook.EventItemPublish {
			if conf.DisablePublication || !conf.EnablePulicationOnWebhook {
				// skip
				return nil
			}

			// publish event: create resources to ckan
			act = "create resources to ckan"
			err = s.RegisterCkanResources(ctx, item, false)

			if err != nil {
				comment := fmt.Sprintf("G空間情報センターへの登録処理でエラーが発生しました。%v", err)
				s.commentToItem(ctx, item.ID, comment)
			} else {
				s.commentToItem(ctx, item.ID, "G空間情報センターへの登録が完了しました")
			}
		} else {
			if conf.DisableCatalogCheck || item.CatalogStatus != "" && item.CatalogStatus != StatusReady {
				// skip
				return nil
			}

			// create or update event: check the catalog file
			act = "check catalog"
			err = s.CheckCatalog(ctx, w.ItemData.Schema.ProjectID, item)

			if err != nil {
				comment := fmt.Sprintf("目録ファイルの検査でエラーが発生しました。%v", err)
				s.commentToItem(ctx, item.ID, comment)

				// update item
				if _, err2 := s.CMS.UpdateItem(ctx, item.ID, Item{
					CatalogStatus: StatusError,
				}.Fields(), nil); err2 != nil {
					log.Errorfc(ctx, "failed to update item %s: %s", item.ID, err2)
				}
			} else {
				s.commentToItem(ctx, item.ID, "目録ファイルの検査が完了しました。エラーはありません。")
			}
		}

		if err != nil {
			log.Errorfc(ctx, "geospatialjp webhook: failed to %s: %s", act, err)
		}

		log.Infofc(ctx, "geospatialjp webhook: done")
		return nil
	}, nil
}
