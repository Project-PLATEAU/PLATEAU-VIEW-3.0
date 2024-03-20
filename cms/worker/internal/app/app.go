package app

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	rlog "github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	sns "github.com/robbiet480/go.sns"
	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho"
)

func initEcho(ctx context.Context, cfg *ServerConfig, handler *Handler) *echo.Echo {
	if cfg.Config == nil {
		log.Fatalln("ServerConfig.Config is nil")
	}

	e := echo.New()
	e.Debug = cfg.Debug
	e.HideBanner = true
	e.HidePort = true
	e.HTTPErrorHandler = errorHandler(e.DefaultHTTPErrorHandler)

	logger := rlog.NewEcho()
	e.Logger = logger
	e.Use(
		middleware.Recover(),
		logger.AccessLogger(),
		otelecho.Middleware("reearth-cms/worker"),
	)

	awsSNSSubscriptionConfirmationMiddleware := awsSNSSubscriptionConfirmationMiddleware()

	api := e.Group("/api")

	api.GET("/ping", func(c echo.Context) error { return c.JSON(http.StatusOK, "pong") })

	t := handler.DecompressHandler()
	api.POST("/decompress", t, awsSNSSubscriptionConfirmationMiddleware)

	wh := handler.WebhookHandler()
	api.POST("/webhook", wh, awsSNSSubscriptionConfirmationMiddleware)

	return e
}

func errorMessage(err error, log func(string, ...interface{})) (int, string) {
	code := http.StatusBadRequest
	msg := err.Error()

	if err2, ok := err.(*echo.HTTPError); ok {
		code = err2.Code
		if msg2, ok := err2.Message.(string); ok {
			msg = msg2
		} else if msg2, ok := err2.Message.(error); ok {
			msg = msg2.Error()
		} else {
			msg = "error"
		}
		if err2.Internal != nil {
			log("echo internal err: %+v", err2)
		}
	} else if errors.Is(err, rerror.ErrNotFound) {
		code = http.StatusNotFound
		msg = "not found"
	} else {
		if ierr := rerror.UnwrapErrInternal(err); ierr != nil {
			code = http.StatusInternalServerError
			msg = "internal server error"
		}
	}

	return code, msg
}

func errorHandler(next func(error, echo.Context)) func(error, echo.Context) {
	return func(err error, c echo.Context) {
		if c.Response().Committed {
			return
		}

		code, msg := errorMessage(err, func(f string, args ...interface{}) {
			c.Echo().Logger.Errorf(f, args...)
		})
		if err := c.JSON(code, map[string]string{
			"error": msg,
		}); err != nil {
			next(err, c)
		}
	}
}

func handleSubscriptionConfirmation(c echo.Context) error {
	var payload sns.Payload
	if err := json.NewDecoder(c.Request().Body).Decode(&payload); err != nil {
		rlog.Errorf("failed to decode request body: %s", err.Error())
		return err
	}

	_, err := payload.Subscribe()
	if err != nil {
		rlog.Errorf("failed to subscribe confirmation: %s", err.Error())
		return err
	}

	return c.JSON(http.StatusOK, "OK")
}

func awsSNSSubscriptionConfirmationMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if c.Request().Header.Get("X-Amz-Sns-Message-Type") == "SubscriptionConfirmation" {
				return handleSubscriptionConfirmation(c)
			}
			return next(c)
		}
	}
}
