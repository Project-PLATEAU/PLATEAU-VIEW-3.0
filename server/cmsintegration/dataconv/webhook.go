package dataconv

import (
	"context"
	"net/http"

	"github.com/pkg/errors"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
)

const defaultCMSModel = "dataset"

type Config struct {
	Disable  bool
	CMSBase  string
	CMSToken string
	// optional
	CMSModel string
	APIToken string
}

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	s, err := NewService(conf)
	if err != nil || s == nil {
		return nil, err
	}
	return func(req *http.Request, w *cmswebhook.Payload) error {
		return webhookHandler(req.Context(), s, w)
	}, nil
}

func webhookHandler(ctx context.Context, s *Service, w *cmswebhook.Payload) error {
	pid := w.ProjectID()
	if w.Type != cmswebhook.EventItemCreate && w.Type != cmswebhook.EventItemUpdate ||
		pid == "" ||
		w.ItemData == nil ||
		w.ItemData.Item == nil ||
		w.ItemData.Model == nil ||
		w.ItemData.Model.Key != s.model() ||
		w.Operator.User == nil {
		var key string
		if w.ItemData != nil && w.ItemData.Model != nil {
			key = w.ItemData.Model.Key
		}
		// skipped
		log.Debugfc(ctx, "dataconv: skipped: invalid webhook: type=%s, projectid=%s, model=%s", w.Type, pid, key)
		return nil
	}

	var i Item
	w.ItemData.Item.Unmarshal(&i)

	if err := s.Convert(ctx, i, pid); err != nil {
		if errors.Cause(err) == ErrSkip {
			log.Infofc(ctx, "dataconv: skipped: %v", err)
		} else {
			log.Errorfc(ctx, "dataconv: failed: %v", err)
		}
	}

	log.Infofc(ctx, "dataconv: done: %s", i.ID)
	return nil
}
