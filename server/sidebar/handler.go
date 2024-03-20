package sidebar

import (
	"github.com/eukarya-inc/reearth-plateauview/server/plateaucms"
)

type Config struct {
	plateaucms.Config
	DisableShare bool
}

type Handler struct {
	cms *plateaucms.CMS
}

func NewHandler(c Config) (*Handler, error) {
	cms, err := plateaucms.New(c.Config)
	if err != nil {
		return nil, err
	}

	return &Handler{
		cms: cms,
	}, nil
}
