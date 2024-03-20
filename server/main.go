package main

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"reflect"
	"runtime"
	"runtime/debug"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/putil"
	"github.com/eukarya-inc/reearth-plateauview/server/tool"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"golang.org/x/net/http2"
)

func main() {
	conf := lo.Must(NewConfig())

	if len(os.Args) > 1 && os.Args[1] != "" {
		tool.Main(&tool.Config{
			CMS_BaseURL: conf.CMS_BaseURL,
			CMS_Token:   conf.CMS_Token,
		}, os.Args[1:])
		return
	}

	main2(conf)
}

func main2(conf *Config) {
	log.Infof("reearth-plateauview\n")
	log.Infof("config: %s", conf.Print())

	if conf.GCParcent > 0 {
		debug.SetGCPercent(conf.GCParcent)
	}

	logger := log.NewEcho()
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true
	e.Logger = logger
	e.HTTPErrorHandler = errorHandler(e.DefaultHTTPErrorHandler)
	e.Validator = &customValidator{validator: validator.New()}
	e.Use(
		middleware.Recover(),
		echo.WrapMiddleware(appx.RequestIDMiddleware()),
		logger.AccessLogger(),
		middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins: conf.Origin,
		}),
	)

	e.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, "pong")
	}, putil.NoCacheMiddleware)

	e.GET("/proxy/*", proxyHandlerFunc, ACAOHeaderOverwriteMiddleware)

	services := lo.Must(Services(conf))
	serviceNames := lo.Map(services, func(s *Service, _ int) string { return s.Name })
	webhookHandlers := []cmswebhook.Handler{}
	for _, s := range services {
		if s.Echo != nil {
			g := e.Group("")
			if !s.DisableNoCache {
				g.Use(putil.NoCacheMiddleware)
			}
			lo.Must0(s.Echo(g))
		}
		if s.Webhook != nil {
			webhookHandlers = append(webhookHandlers, s.Webhook)
		}
	}

	cmsWebhookHandler(
		e.Group("/webhook"),
		[]byte(conf.CMS_Webhook_Secret),
		webhookHandlers,
	)

	log.Infof("enabled services: %v", serviceNames)
	addr := fmt.Sprintf("[::]:%d", conf.Port)
	log.Infof("http server started on %s", addr)
	log.Fatalf("%v", e.StartH2CServer(addr, &http2.Server{}))
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
	} else if errors.Is(err, cms.ErrNotFound) {
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

type customValidator struct {
	validator *validator.Validate
}

func (cv *customValidator) Validate(i any) error {
	if err := cv.validator.Struct(i); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	return nil
}

func funcName(i interface{}) string {
	return strings.TrimPrefix(runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name(), "main.")
}
