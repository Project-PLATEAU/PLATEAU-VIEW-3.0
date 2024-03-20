package geospatialjpv3

import (
	"net/http/httptest"
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/ckan"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsmock"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/stretchr/testify/assert"
)

func TestHandler_Webhook(t *testing.T) {
	packages := []ckan.Package{}
	resources := []ckan.Resource{}

	cmsmock := &cmsmock.CMSMock{}
	ckanmock := ckan.NewMock("test", packages, resources)

	h := &handler{
		cms:  cmsmock,
		ckan: ckanmock,
	}

	wh, err := h.Webhook(Config{
		// TODO
	})
	assert.NoError(t, err)

	payload := &cmswebhook.Payload{
		// TODO
	}
	t.Run("invalid request", func(t *testing.T) {
		err = wh(nil, payload)
		assert.NoError(t, err)
	})

	t.Run("success", func(t *testing.T) {
		assert.NoError(t, wh(httptest.NewRequest("POST", "/", nil), payload)) // first
	})

	// TODO: assert ckan packages and resources
}
