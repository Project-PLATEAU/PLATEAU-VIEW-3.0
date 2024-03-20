package cmsintegrationv2

import (
	"net/http"

	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
)

const (
	modelKey = "plateau"
)

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	s, err := NewServices(conf)
	if err != nil {
		return nil, err
	}

	return func(req *http.Request, w *cmswebhook.Payload) error {
		ctx := req.Context()

		if !w.Operator.IsUser() && w.Operator.IsIntegrationBy(conf.CMSIntegration) {
			log.Debugfc(ctx, "cmsintegration webhook: invalid event operator: %+v", w.Operator)
			return nil
		}

		if w.Type != cmswebhook.EventItemCreate && w.Type != cmswebhook.EventItemUpdate {
			log.Debugfc(ctx, "cmsintegration webhook: invalid event type: %s", w.Type)
			return nil
		}

		if w.ItemData == nil || w.ItemData.Item == nil || w.ItemData.Model == nil {
			log.Debugfc(ctx, "cmsintegration webhook: invalid event data: %+v", w.Data)
			return nil
		}

		if w.ItemData.Model.Key != modelKey {
			log.Debugfc(ctx, "cmsintegration webhook: invalid model id: %s, key: %s", w.ItemData.Item.ModelID, w.ItemData.Model.Key)
			return nil
		}

		item := ItemFrom(*w.ItemData.Item)
		item.ProjectID = w.ItemData.Schema.ProjectID

		// SDK
		s.RequestMaxLODExtraction(ctx, item, item.ProjectID, false)

		// embed dic
		if item.Dic == "" && item.Dictionary != "" {
			if dicAsset, err := s.CMS.Asset(ctx, item.Dictionary); err != nil {
				log.Errorfc(ctx, "cmsintegration webhook: failed to get dic asset: %v", err)
			} else if d, err := readDic(ctx, dicAsset.URL); err != nil {
				log.Errorfc(ctx, "cmsintegration webhook: failed to read dic: %v", err)
			} else if _, err = s.CMS.UpdateItem(ctx, item.ID, Item{
				Dic: d,
			}.Fields(), nil); err != nil {
				log.Errorfc(ctx, "cmsintegration webhook: failed to update dic: %v", err)
			} else {
				item.Dic = d
				log.Infofc(ctx, "cmsintegration webhook: dic embedded to %s", item.ID)
			}
		}

		if !item.ConversionEnabled.Enabled() {
			log.Infofc(ctx, "cmsintegration webhook: convertion disabled: %+v", item)
			return nil
		}

		if item.ConversionStatus == StatusOK {
			log.Infofc(ctx, "cmsintegration webhook: convertion already done: %+v", item)
			return nil
		}

		if item.ConversionStatus == StatusProcessing {
			log.Infofc(ctx, "cmsintegration webhook: convertion processing: %+v", item)
			return nil
		}

		if item.CityGML == "" {
			log.Infofc(ctx, "cmsintegration webhook: invalid field value: %+v", item)
			return nil
		}

		asset, err := s.CMS.Asset(ctx, item.CityGML)
		if err != nil || asset == nil || asset.ID == "" {
			log.Infofc(ctx, "cmsintegration webhook: cannot fetch asset: %w", err)
			return nil
		}

		fmeReq := ConversionRequest{
			ID: fmeID{
				ItemID:    w.ItemData.Item.ID,
				AssetID:   asset.ID,
				ProjectID: w.ItemData.Schema.ProjectID,
			}.String(conf.Secret),
			Target:             asset.URL,
			PRCS:               item.PRCS.EPSGCode(),
			DevideODC:          item.DevideODC.Enabled(),
			QualityCheckParams: item.QualityCheckParams,
			QualityCheck:       !conf.FMESkipQualityCheck,
		}

		if s.FME == nil {
			log.Infofc(ctx, "webhook: fme mocked: %+v", fmeReq)
		} else if err := s.FME.Request(ctx, fmeReq); err != nil {
			log.Errorfc(ctx, "cmsintegration webhook: failed to request fme: %v", err)
			return nil
		}

		if _, err := s.CMS.UpdateItem(ctx, item.ID, Item{
			ConversionStatus: StatusProcessing,
		}.Fields(), nil); err != nil {
			log.Errorfc(ctx, "cmsintegration webhook: failed to update item: %w", err)
			return nil
		}

		if err := s.CMS.CommentToItem(ctx, item.ID, "CityGMLの品質検査及び3D Tilesへの変換を開始しました。"); err != nil {
			log.Errorfc(ctx, "cmsintegration webhook: failed to comment: %v", err)
			return nil
		}

		log.Infofc(ctx, "cmsintegration webhook: done")

		return nil
	}, nil
}
