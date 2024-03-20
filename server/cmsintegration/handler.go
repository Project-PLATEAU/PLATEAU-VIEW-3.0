package cmsintegration

import (
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationv2"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationv2/geospatialjpv2"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationv3"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationv3/geospatialjpv3"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/dataconv"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
)

type Config = cmsintegrationcommon.Config

func Handler(conf Config, g *echo.Group) error {
	// v3
	if err := cmsintegrationv3.Handler(conf, g); err != nil {
		return err
	}

	// v2 (compat)
	return compatHandler(conf, g)
}

func compatHandler(conf Config, g *echo.Group) error {
	v2, err := cmsintegrationv2.NotifyHandler(conf)
	if err != nil {
		return err
	}

	geo, err := geospatialjpv2.Handler(geospatialjpv2Config(conf))
	if err != nil {
		return err
	}

	dataconv, err := dataconv.Handler(dataConvConfig(conf))
	if err != nil {
		return err
	}

	g.POST("/notify_fme", v2)
	g.POST("/publish_to_geospatialjp", geo)
	g.POST("/dataconv", echo.WrapHandler(dataconv))
	return nil
}

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	hv3, err := cmsintegrationv3.WebhookHandler(conf)
	if err != nil {
		return nil, err
	}

	hv3geo, err := geospatialjpv3.WebhookHandler(geospatialjpv3Config(conf))
	if err != nil {
		return nil, err
	}

	// compat
	hv2, err := cmsintegrationv2.WebhookHandler(conf)
	if err != nil {
		return nil, err
	}

	// compat
	hv2geo, err := geospatialjpv2.WebhookHandler(geospatialjpv2Config(conf))
	if err != nil {
		return nil, err
	}

	// compat
	hv2dataconv, err := dataconv.WebhookHandler(dataConvConfig(conf))
	if err != nil {
		return nil, err
	}

	return cmswebhook.MergeHandlers([]cmswebhook.Handler{
		hv3, hv3geo, hv2, hv2geo, hv2dataconv,
	}), nil
}

func geospatialjpv2Config(conf Config) geospatialjpv2.Config {
	return geospatialjpv2.Config{
		CMSBase:             conf.CMSBaseURL,
		CMSToken:            conf.CMSToken,
		CMSIntegration:      conf.CMSIntegration,
		CkanBase:            conf.CkanBaseURL,
		CkanOrg:             conf.CkanOrg,
		CkanToken:           conf.CkanToken,
		CkanPrivate:         conf.CkanPrivate,
		DisablePublication:  conf.DisableGeospatialjpPublication,
		DisableCatalogCheck: conf.DisableGeospatialjpCatalogCheck,
		PublicationToken:    conf.APIToken,
		// EnablePulicationOnWebhook: true,
	}
}

func geospatialjpv3Config(conf Config) geospatialjpv3.Config {
	return geospatialjpv3.Config{
		CMSBase:               conf.CMSBaseURL,
		CMSToken:              conf.CMSToken,
		CMSIntegration:        conf.CMSIntegration,
		CkanBase:              conf.CkanBaseURL,
		CkanOrg:               conf.CkanOrg,
		CkanToken:             conf.CkanToken,
		BuildType:             conf.GeospatialjpBuildType,
		CloudRunJobsJobName:   conf.GeospatialjpCloudRunJobsJobName,
		CloudBuildImage:       conf.GeospatialjpCloudBuildImage,
		CloudBuildMachineType: conf.GeospatialjpCloudBuildMachineType,
		CloudBuildProject:     conf.GeospatialjpCloudBuildProject,
		CloudBuildRegion:      conf.GeospatialjpCloudBuildRegion,
		CloudBuildDiskSizeGb:  conf.GeospatialjpCloudBuildDiskSizeGb,
	}
}

func dataConvConfig(conf Config) dataconv.Config {
	return dataconv.Config{
		Disable:  conf.DisableDataConv,
		CMSBase:  conf.CMSBaseURL,
		CMSToken: conf.CMSToken,
		APIToken: conf.APIToken,
		// CMSModel: conf.CMSModel,
	}
}
