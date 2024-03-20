package dataconv

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/jarcoal/httpmock"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/stretchr/testify/assert"
)

var borderURL = fmt.Sprintf("http://example.com/%s.geojson", borderName)

func TestWebhook(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	httpmock.RegisterResponder("GET", borderURL, httpmock.NewStringResponder(http.StatusOK, border))

	ctx := context.Background()
	srv := &Service{cms: &cmsMock{}, conf: Config{CMSModel: defaultCMSModel}}

	// case1: skip conv
	err := webhookHandler(ctx, srv, &cmswebhook.Payload{
		Type: cmswebhook.EventItemUpdate,
		ItemData: &cmswebhook.ItemData{
			Item: &cms.Item{
				ID: "xxx",
				Fields: Item{
					Type:       "行政界",
					DataFormat: "GeoJSON",
					Data:       "aaa",
					DataConv:   "変換しない",
				}.Fields(),
			},
			Model: &cms.Model{Key: "dataset"},
			Schema: &cms.Schema{
				ProjectID: "project",
			},
		},
		Operator: cmswebhook.Operator{User: &cmswebhook.User{}},
	})

	assert.NoError(t, err)
	assert.Nil(t, srv.cms.(*cmsMock).i)

	// case2: normal
	err = webhookHandler(ctx, srv, &cmswebhook.Payload{
		Type: cmswebhook.EventItemUpdate,
		ItemData: &cmswebhook.ItemData{
			Item: &cms.Item{
				ID: "xxx",
				Fields: Item{
					Type:       "行政界",
					DataFormat: "GeoJSON",
					Data:       "aaa",
				}.Fields(),
			},
			Model: &cms.Model{Key: "dataset"},
			Schema: &cms.Schema{
				ProjectID: "project",
			},
		},
		Operator: cmswebhook.Operator{User: &cmswebhook.User{}},
	})

	assert.NoError(t, err)
	assert.Equal(t, &cms.Item{
		ID: "xxx",
		Fields: Item{
			DataFormat: "CZML",
			Data:       "asset",
			DataOrig:   []string{"aaa"},
		}.Fields(),
	}, srv.cms.(*cmsMock).i)
}
