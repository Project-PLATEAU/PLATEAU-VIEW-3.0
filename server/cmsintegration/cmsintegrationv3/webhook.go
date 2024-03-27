package cmsintegrationv3

import (
	"net/http"
	"strings"

	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
	"golang.org/x/exp/slices"
)

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	s, err := NewServices(conf)
	if err != nil {
		return nil, err
	}

	return func(req *http.Request, w *cmswebhook.Payload) error {
		ctx := req.Context()

		if !w.Operator.IsUser() && w.Operator.IsIntegrationBy(conf.CMSIntegration) {
			log.Debugfc(ctx, "cmsintegrationv3 webhook: invalid event operator: %+v", w.Operator)
			return nil
		}

		if w.Type != cmswebhook.EventItemCreate && w.Type != cmswebhook.EventItemUpdate {
			log.Debugfc(ctx, "cmsintegrationv3 webhook: invalid event type: %s", w.Type)
			return nil
		}

		if w.ItemData == nil || w.ItemData.Item == nil || w.ItemData.Model == nil {
			log.Debugfc(ctx, "cmsintegrationv3 webhook: invalid event data: %+v", w.Data)
			return nil
		}

		if !strings.HasPrefix(w.ItemData.Model.Key, modelPrefix) {
			log.Debugfc(ctx, "cmsintegrationv3 webhook: invalid model id: %s, key: %s", w.ItemData.Item.ModelID, w.ItemData.Model.Key)
			return nil
		}

		modelName := strings.TrimPrefix(w.ItemData.Model.Key, modelPrefix)
		var err error

		if modelName == relatedModel {
			err = handleRelatedDataset(ctx, s, w)
		} else if modelName == sampleModel || slices.Contains(featureTypes, modelName) {
			err = sendRequestToFME(ctx, s, &conf, w)
		}

		if err != nil {
			log.Errorfc(ctx, "cmsintegrationv3 webhook: failed to process event: %v", err)
		}

		log.Debugfc(ctx, "cmsintegrationv3 webhook: done: %s", modelName)
		return nil
	}, nil
}
