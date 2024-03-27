package preparegspatialjp

import (
	"strings"

	"github.com/reearth/reearthx/log"
)

type MultipleConfig struct {
	CityItemID []string
	Config
}

func CommandMultiple(conf *MultipleConfig) error {
	le := len(conf.CityItemID)
	for i, cityItemID := range conf.CityItemID {
		log.Infof("START: cityItem=%s (%d/%d)", cityItemID, i+1, le)

		conf.Config.CityItemID = cityItemID
		if err := CommandSingle(&conf.Config); err != nil {
			return err
		}
	}

	return nil
}

func (c *Config) ToMultiple() *MultipleConfig {
	if c == nil {
		return nil
	}

	cities := strings.Split(c.CityItemID, ",")
	if len(cities) == 0 {
		return nil
	}

	return &MultipleConfig{
		CityItemID: cities,
		Config:     *c,
	}
}

func Command(c *Config) error {
	if mc := c.ToMultiple(); mc != nil {
		return CommandMultiple(mc)
	}

	return nil
}
