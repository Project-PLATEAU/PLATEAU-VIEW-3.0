package app

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
	rhttp "github.com/reearth/reearth-cms/worker/internal/adapter/http"
	"github.com/reearth/reearth-cms/worker/pkg/webhook"
	"github.com/reearth/reearthx/log"
	sns "github.com/robbiet480/go.sns"
)

type Handler struct {
	Controller *rhttp.Controller
}

func NewHandler(c *rhttp.Controller) *Handler {
	return &Handler{Controller: c}
}

func (h Handler) DecompressHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		var input rhttp.DecompressInput
		var err error

		if h.isAWS(c.Request()) {
			input, err = parseSNSDecompressMessage(c.Request().Body)
		} else if h.isGCP(c.Request()) {
			input, err = parsePubSubDecompressMessage(c, c.Request().Body)
		} else {
			err = errors.New("unsupported request source")
		}

		if err != nil {
			log.Errorf("failed to parse request body: %s", err.Error())
			return err
		}

		if err := h.Controller.DecompressController.Decompress(c.Request().Context(), input); err != nil {
			log.Errorf("failed to decompress. input: %#v err:%s", input, err.Error())
			return err
		}
		log.Infof("successfully decompressed: Asset=%s, Path=%s", input.AssetID, input.Path)
		return c.NoContent(http.StatusOK)
	}
}

func (h Handler) WebhookHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		var webhook webhook.Webhook
		var err error

		if h.isAWS(c.Request()) {
			webhook, err = parseSNSWebhookMessage(c.Request().Body)
		} else if h.isGCP(c.Request()) {
			webhook, err = parsePubSubWebhookMessage(c, c.Request().Body)
		} else {
			err = errors.New("unsupported request source")
		}

		if err != nil {
			log.Errorf("failed to parse request body: %s", err.Error())
			return err
		}

		if err := h.Controller.WebhookController.Webhook(c.Request().Context(), &webhook); err != nil {
			log.Errorf("failed to send webhook. webhook: %#v err:%s", webhook, err.Error())
			return err
		}

		log.Infof("webhook has been sent: %#v", webhook)
		return c.NoContent(http.StatusOK)
	}
}

func (h Handler) isAWS(r *http.Request) bool {
	return r.Header.Get("X-Amz-Sns-Message-Type") == "Notification"
}

func (h Handler) isGCP(r *http.Request) bool {
	// TODO: need to find a way to detect GCP requests
	return true
}

func parseSNSDecompressMessage(body io.Reader) (rhttp.DecompressInput, error) {
	var payload sns.Payload
	var input rhttp.DecompressInput

	if err := json.NewDecoder(body).Decode(&payload); err != nil {
		return input, err
	}

	if err := json.Unmarshal([]byte(payload.Message), &input); err != nil {
		return input, err
	}

	// Validates payload's signature
	if err := payload.VerifyPayload(); err != nil {
		return input, err
	}

	return input, nil
}

func parsePubSubDecompressMessage(c echo.Context, body io.Reader) (rhttp.DecompressInput, error) {
	var input rhttp.DecompressInput

	if err := c.Bind(&input); err != nil {
		log.Errorf("failed to decompress: err=%s", err.Error())
		return input, err
	}

	return input, nil
}

func parseSNSWebhookMessage(body io.Reader) (webhook.Webhook, error) {
	var payload sns.Payload
	var w webhook.Webhook

	if err := json.NewDecoder(body).Decode(&payload); err != nil {
		return w, err
	}

	if err := json.Unmarshal([]byte(payload.Message), &w); err != nil {
		return w, err
	}

	// Validates payload's signature
	if err := payload.VerifyPayload(); err != nil {
		return w, err
	}

	return w, nil
}

func parsePubSubWebhookMessage(c echo.Context, body io.Reader) (webhook.Webhook, error) {
	var msg msgBody
	var w webhook.Webhook

	if err := c.Bind(&msg); err != nil {
		if err := c.Bind(&w); err != nil {
			return w, err
		}
	} else if data, err := msg.Data(); err != nil {
		return w, err
	} else if err := json.Unmarshal(data, &w); err != nil {
		return w, err
	}

	return w, nil
}

type msgBody struct {
	Message struct {
		Data string `json:"data"`
	} `json:"message"`
}

func (b msgBody) Data() ([]byte, error) {
	if b.Message.Data == "" {
		return nil, nil
	}

	return base64.StdEncoding.DecodeString(b.Message.Data)
}
