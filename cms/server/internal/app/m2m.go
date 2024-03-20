package app

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"

	compose "github.com/hallazzang/echo-compose"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	rhttp "github.com/reearth/reearth-cms/server/internal/adapter/http"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/log"
	sns "github.com/robbiet480/go.sns"
	"github.com/samber/lo"
)

func NotifyHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		var input rhttp.NotifyInput
		var err error

		if isAWS(c.Request()) {
			input, err = parseSNSMessage(c.Request().Body)
		} else if isGCP(c.Request()) {
			input, err = parsePubSubMessage(c)
		} else {
			err = errors.New("unsupported request source")
		}

		if err != nil {
			log.Errorfc(ctx, "failed to parse request body: %s", err.Error())
			return err
		}

		log.Infofc(ctx, "notified and updating files begin: assetID=%s type=%s status=%s", input.AssetID, input.Type, input.Status)

		assetUC := adapter.Usecases(ctx).Asset
		controller := rhttp.NewTaskController(assetUC)

		if err := controller.Notify(ctx, input); err != nil {
			log.Errorf("failed to update files: assetID=%s, type=%s, status=%s, err=%v", input.AssetID, input.Type, input.Status, err)
			return err
		}

		log.Infof("successfully notified and files has been updated: assetID=%s, type=%s, status=%s", input.AssetID, input.Type, input.Status)
		return c.JSON(http.StatusOK, "OK")
	}
}

func handleSubscriptionConfirmation(c echo.Context) error {
	var payload sns.Payload
	if err := json.NewDecoder(c.Request().Body).Decode(&payload); err != nil {
		log.Errorf("failed to decode request body: %s", err.Error())
		return err
	}

	_, err := payload.Subscribe()
	if err != nil {
		log.Errorf("failed to subscribe confirmation: %s", err.Error())
		return err
	}

	return c.JSON(http.StatusOK, "OK")
}

func isAWSSNSSubscriptionConfirmation(request *http.Request) bool {
	return request.Header.Get("X-Amz-Sns-Message-Type") == "SubscriptionConfirmation"
}

func isAWS(r *http.Request) bool {
	return r.Header.Get("X-Amz-Sns-Message-Type") == "Notification"
}

func isGCP(_ *http.Request) bool {
	// TODO: need to find a way to detect GCP requests
	return true
}

func parseSNSMessage(body io.Reader) (rhttp.NotifyInput, error) {
	var payload sns.Payload
	var input rhttp.NotifyInput

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

func parsePubSubMessage(c echo.Context) (rhttp.NotifyInput, error) {
	var input rhttp.NotifyInput
	var b pubsubBody
	if err := c.Bind(&b); err != nil {
		if err := c.Bind(&input); err != nil {
			return input, err
		}
	}

	if b.Message.Attributes.BuildID != "" {
		input = rhttp.NotifyInput{
			Type:    "assetDecompressTaskNotify",
			AssetID: "-",
			Status:  new(asset.ArchiveExtractionStatus),
			Task: &rhttp.NotifyInputTask{
				TaskID: b.Message.Attributes.BuildID,
				Status: b.Message.Attributes.Status,
			},
		}
	} else if data, err := b.Data(); err != nil {
		return input, err
	} else if err := json.Unmarshal(data, &input); err != nil {
		return input, err
	}

	return input, nil
}

type pubsubBody struct {
	Message struct {
		Attributes struct {
			BuildID string `json:"buildId"`
			Status  string `json:"status"`
		} `json:"attributes"`
		Data string `json:"data"`
	} `json:"message"`
}

func (b pubsubBody) Data() ([]byte, error) {
	if b.Message.Data == "" {
		return nil, nil
	}

	return base64.StdEncoding.DecodeString(b.Message.Data)
}

func M2MAuthMiddleware(cfg *Config) echo.MiddlewareFunc {
	var m2mAuthMiddleware echo.MiddlewareFunc
	if cfg.AWSTask.NotifyToken != "" {
		m2mAuthMiddleware = awsM2MAuthTokenMiddleware(cfg.AWSTask.NotifyToken)
	} else {
		m2mAuthMiddleware = echo.WrapMiddleware(lo.Must(
			appx.AuthMiddleware(cfg.AuthM2M.JWTProvider(), adapter.ContextAuthInfo, false), // it shoud not be optional
		))
	}

	return compose.Compose(
		m2MGenerateOperatorMiddleware(cfg.AuthM2M.Email),
		m2mAuthMiddleware,
	)
}

func awsM2MAuthTokenMiddleware(token string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			t := c.QueryParam("token")
			if t != token {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token")
			}

			if isAWSSNSSubscriptionConfirmation(c.Request()) {
				// Handle AWS SNS subscription confirmation
				// This is used to handle requests for AWS SNS subscription confirmation and is only executed during initial setup
				// https://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.prepare.html
				return handleSubscriptionConfirmation(c)
			}

			return next(c)
		}
	}
}

func m2MGenerateOperatorMiddleware(email string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := c.Request().Context()
			if ai, ok := ctx.Value(adapter.ContextAuthInfo).(appx.AuthInfo); ok {
				if ai.EmailVerified == nil || !*ai.EmailVerified || ai.Email != email {
					return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
				}
			}

			op, err := generateMachineOperator()
			if err != nil {
				return err
			}

			ctx = adapter.AttachOperator(ctx, op)
			c.SetRequest(c.Request().WithContext(ctx))

			return next(c)
		}
	}
}

func generateMachineOperator() (*usecase.Operator, error) {
	return &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: nil,
		},
		Integration: nil,
		Machine:     true,
	}, nil
}
