package geospatialjpv3

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCityItem_YearInt(t *testing.T) {
	c := CityItem{
		Year: "2023年度",
	}
	assert.Equal(t, 2023, c.YearInt())
}

func TestCityItem_SpecVersion(t *testing.T) {
	c := CityItem{
		Spec: "第3.4版",
	}
	assert.Equal(t, "3.4", c.SpecVersion())
	c = CityItem{}
	assert.Empty(t, c.SpecVersion())
}

func TestCityItem_SpecVersionFull(t *testing.T) {
	c := CityItem{
		Spec: "第3.4版",
	}
	assert.Equal(t, "3.4.0", c.SpecVersionFull())
	c = CityItem{}
	assert.Empty(t, c.SpecVersionFull())
}

func TestCityItem_SpecVersionMajorInt(t *testing.T) {
	c := CityItem{
		Spec: "第3.4版",
	}
	assert.Equal(t, 3, c.SpecVersionMajorInt())
	c = CityItem{}
	assert.Empty(t, c.SpecVersionMajorInt())
}
