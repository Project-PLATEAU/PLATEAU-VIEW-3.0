package sdkapi

import (
	"github.com/eukarya-inc/reearth-plateauview/server/sdkapi/sdkapiv2"
	"github.com/eukarya-inc/reearth-plateauview/server/sdkapi/sdkapiv3"
	"github.com/labstack/echo/v4"
)

type Config struct {
	V2    sdkapiv2.Config
	V3    sdkapiv3.Config
	UseV2 bool
}

func Handler(conf Config, g *echo.Group) (bool, error) {
	if conf.UseV2 {
		return sdkapiv2.Handler(conf.V2, g)
	}

	return sdkapiv3.Handler(conf.V3, g)
}
