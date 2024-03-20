package cmsintegrationcommon

type Config struct {
	// general
	Host     string
	Secret   string
	Debug    bool
	APIToken string
	// CMS
	CMSBaseURL     string
	CMSToken       string
	CMSIntegration string
	// geospatial.jp
	CkanBaseURL                    string
	CkanOrg                        string
	CkanToken                      string
	CkanPrivate                    bool
	DisableGeospatialjpPublication bool
	// dataconv
	DisableDataConv bool
	// FME common
	FMEMock bool
	// FME v3
	FMEURLV3 string
	// geospatial.jp v3
	GeospatialjpBuildType             string
	GeospatialjpCloudRunJobsJobName   string
	GeospatialjpCloudBuildImage       string
	GeospatialjpCloudBuildMachineType string
	GeospatialjpCloudBuildProject     string
	GeospatialjpCloudBuildRegion      string
	GeospatialjpCloudBuildDiskSizeGb  int64

	// compat
	// geospatial.jp v2
	DisableGeospatialjpCatalogCheck bool
	// FME v2
	FMEBaseURL          string
	FMEBaseURLV2        string
	FMEToken            string
	FMESkipQualityCheck bool
}
