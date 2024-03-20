package cmsintegrationv2

import (
	"fmt"
	"net/url"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	cms "github.com/reearth/reearth-cms-api/go"
)

type Config = cmsintegrationcommon.Config

type Services struct {
	FME       fmeInterface
	CMS       cms.Interface
	FMESecret string
}

func NewServices(c Config) (s Services, _ error) {
	if !c.FMEMock {
		fmeBaseURL := c.FMEBaseURLV2
		if fmeBaseURL == "" {
			fmeBaseURL = c.FMEBaseURL
		}

		resultURL, err := url.JoinPath(c.Host, "/notify_fme")
		if err != nil {
			return Services{}, fmt.Errorf("failed to init fme: %w", err)
		}

		fme, err := newFME(fmeBaseURL, c.FMEToken, resultURL)
		if err != nil {
			return Services{}, fmt.Errorf("failed to init fme: %w", err)
		}
		s.FME = fme
	}

	cms, err := cms.New(c.CMSBaseURL, c.CMSToken)
	if err != nil {
		return Services{}, fmt.Errorf("failed to init cms: %w", err)
	}
	s.CMS = cms

	return
}
