package geospatialjpv3

import (
	"context"
	"path"

	"github.com/reearth/reearthx/log"
	"google.golang.org/api/cloudbuild/v1"
)

type prepareOnCloudBuildConfig struct {
	City                  string
	Project               string
	CMSURL                string
	CMSToken              string
	CloudBuildImage       string
	CloudBuildMachineType string
	CloudBuildProject     string
	CloudBuildRegion      string
	CloudBuildDiskSizeGb  int64
}

const defaultDockerImage = "eukarya/plateauview2-sidecar-worker:latest"
const defaultDiskSizeGb = 1000

func prepareOnCloudBuild(ctx context.Context, conf prepareOnCloudBuildConfig) error {
	if conf.CloudBuildImage == "" {
		conf.CloudBuildImage = defaultDockerImage
	}
	if conf.CloudBuildDiskSizeGb == 0 {
		conf.CloudBuildDiskSizeGb = defaultDiskSizeGb
	}

	log.Debugfc(ctx, "geospatialjp webhook: prepare (cloud build): %s", ppp.Sprint(conf))

	return runCloudBuild(ctx, CloudBuildConfig{
		Image: conf.CloudBuildImage,
		Args: []string{
			"prepare-gspatialjp",
			"--city=" + conf.City,
			"--project=" + conf.Project,
			"--wetrun",
		},
		Env: []string{
			"REEARTH_CMS_URL=" + conf.CMSURL,
			"REEARTH_CMS_TOKEN=" + conf.CMSToken,
			"NO_COLOR=true",
		},
		MachineType: conf.CloudBuildMachineType,
		Project:     conf.CloudBuildProject,
		Region:      conf.CloudBuildRegion,
		Tags:        []string{"prepare-geospatialjp"},
		DiskSizeGb:  conf.CloudBuildDiskSizeGb,
	})
}

type CloudBuildConfig struct {
	Image       string
	Args        []string
	Env         []string
	MachineType string
	Region      string
	Project     string
	Tags        []string
	DiskSizeGb  int64
}

func runCloudBuild(ctx context.Context, conf CloudBuildConfig) error {
	cb, err := cloudbuild.NewService(ctx)
	if err != nil {
		return err
	}

	machineType := ""
	if v := conf.MachineType; v != "default" {
		machineType = v
	}

	build := &cloudbuild.Build{
		Timeout:  "86400s", // 1 day
		QueueTtl: "86400s", // 1 day
		Steps: []*cloudbuild.BuildStep{
			{
				Name: conf.Image,
				Args: conf.Args,
				Env:  conf.Env,
			},
		},
		Options: &cloudbuild.BuildOptions{
			MachineType: machineType,
			DiskSizeGb:  conf.DiskSizeGb,
		},
		Tags: conf.Tags,
	}

	call := cb.Projects.Locations.Builds.Create(
		path.Join("projects", conf.Project, "locations", conf.Region),
		build,
	)
	_, err = call.Do()

	if err != nil {
		return err
	}
	return nil
}
