package app

import (
	"errors"
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/adapter/integration"
	"github.com/reearth/reearth-cms/server/internal/adapter/publicapi"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearthx/appx"
	rlog "github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho"
)

func initEcho(cfg *ServerConfig) *echo.Echo {
	if cfg.Config == nil {
		log.Fatalln("ServerConfig.Config is nil")
	}

	e := echo.New()
	e.Debug = cfg.Debug
	e.HideBanner = true
	e.HidePort = true
	e.HTTPErrorHandler = errorHandler(e.DefaultHTTPErrorHandler)

	// basic middleware
	logger := rlog.NewEcho()
	e.Logger = logger
	e.Use(
		logger.AccessLogger(),
		middleware.Recover(),
		otelecho.Middleware("reearth-cms"),
	)
	origins := allowedOrigins(cfg)
	if len(origins) > 0 {
		e.Use(
			middleware.CORSWithConfig(middleware.CORSConfig{
				AllowOrigins: origins,
			}),
		)
	}

	// GraphQL Playground without auth
	if cfg.Debug || cfg.Config.Dev {
		e.GET("/graphql", echo.WrapHandler(
			playground.Handler("reearth-cms", "/api/graphql"),
		))
		log.Printf("gql: GraphQL Playground is available")
	}

	internalJWTMiddleware := echo.WrapMiddleware(lo.Must(
		appx.AuthMiddleware(cfg.Config.JWTProviders(), adapter.ContextAuthInfo, true),
	))

	usecaseMiddleware := UsecaseMiddleware(cfg.Repos, cfg.Gateways, cfg.AcRepos, cfg.AcGateways, interactor.ContainerConfig{
		SignupSecret:    cfg.Config.SignupSecret,
		AuthSrvUIDomain: cfg.Config.Host_Web,
	})

	// apis
	api := e.Group("/api", private)
	api.GET("/ping", Ping())
	api.POST(
		"/graphql", GraphqlAPI(cfg.Config.GraphQL, cfg.Config.Dev),
		internalJWTMiddleware,
		authMiddleware(cfg),
		usecaseMiddleware,
	)
	api.POST(
		"/notify", NotifyHandler(),
		M2MAuthMiddleware(cfg.Config),
		usecaseMiddleware,
	)
	api.POST("/signup", Signup(), usecaseMiddleware)

	publicapi.Echo(api.Group("/p", PublicAPIAuthMiddleware(cfg), usecaseMiddleware))
	integration.RegisterHandlers(api.Group(
		"",
		authMiddleware(cfg),
		AuthRequiredMiddleware(),
		usecaseMiddleware,
		private,
	), integration.NewStrictHandler(integration.NewServer(), nil))

	serveFiles(e, cfg.Gateways.File)
	Web(e, cfg.Config.WebConfig(), cfg.Config.Web_Disabled, nil)
	return e
}

func allowedOrigins(cfg *ServerConfig) []string {
	if cfg == nil {
		return nil
	}
	origins := append([]string{}, cfg.Config.Origins...)
	if cfg.Debug {
		origins = append(origins, "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080")
	}
	return origins
}

func errorMessage(err error, log func(string, ...interface{})) (int, string) {
	code := http.StatusInternalServerError
	msg := "internal server error"

	var httpErr *echo.HTTPError
	if errors.As(err, &httpErr) {
		code = httpErr.Code
		if m, ok := httpErr.Message.(string); ok {
			msg = m
		} else if m, ok := httpErr.Message.(error); ok {
			msg = m.Error()
		} else {
			msg = "error"
		}
		if httpErr.Internal != nil {
			log("echo internal err: %+v", httpErr)
		}
		return code, msg
	}

	if errors.Is(err, rerror.ErrNotFound) {
		code = http.StatusNotFound
		msg = "not found"
		return code, msg
	}

	var rErr *rerror.E
	if errors.As(err, &rErr) {
		code = http.StatusBadRequest
		msg = rErr.Error()
		return code, msg
	}

	var gqlErr *gqlerror.Error
	if errors.As(err, &gqlErr) {
		code = http.StatusBadRequest
		msg = gqlErr.Error()
		return code, msg
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

func private(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Response().Header().Set(echo.HeaderCacheControl, "private, no-store, no-cache, must-revalidate")
		return next(c)
	}
}
