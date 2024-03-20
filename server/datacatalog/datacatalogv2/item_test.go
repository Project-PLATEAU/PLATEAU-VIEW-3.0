package datacatalogv2

import (
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2/datacatalogutil"
	"github.com/stretchr/testify/assert"
)

func TestMainOrConfigItems(t *testing.T) {
	t.Run("returns empty slice when ConfigItems is empty and MainConfigItem is nil", func(t *testing.T) {
		item := DataCatalogItem{}
		assert.Nil(t, item.MainOrConfigItems())
	})

	t.Run("returns main data when ConfigItems is empty and MainConfigItem is not nil", func(t *testing.T) {
		mainItem := datacatalogutil.DataCatalogItemConfigItem{
			URL:    "url",
			Name:   "name",
			Type:   "format",
			Layers: []string{"layer"},
		}
		item := DataCatalogItem{
			URL:    "url",
			Type:   "name",
			Format: "format",
			Layers: []string{"layer"},
		}
		assert.Equal(t, []datacatalogutil.DataCatalogItemConfigItem{mainItem}, item.MainOrConfigItems())
	})

	t.Run("returns config data when ConfigItems is not empty", func(t *testing.T) {
		configItems := []datacatalogutil.DataCatalogItemConfigItem{{
			URL:    "url",
			Name:   "name",
			Type:   "format",
			Layers: []string{"layer"},
		}}
		item := DataCatalogItem{
			URL:    "url",
			Name:   "name",
			Format: "format",
			Layers: []string{"layer"},
			Config: &datacatalogutil.DataCatalogItemConfig{
				Data: configItems,
			},
		}
		assert.Equal(t, configItems, item.MainOrConfigItems())
	})
}
