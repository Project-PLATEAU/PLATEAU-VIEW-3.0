package geospatialjpv3

import (
	"context"

	run "cloud.google.com/go/run/apiv2"
	runpb "cloud.google.com/go/run/apiv2/runpb"
	"github.com/reearth/reearthx/log"
)

// jobName (Cloud Run Jobs): "projects/" + gcpProjectID + "/locations/" + gcpLocation + "/jobs/plateauview-api-worker"

func prepareWithCloudRunJobs(ctx context.Context, itemID, projectID, jobName string) error {
	if jobName == "" {
		log.Debugfc(ctx, "geospatialjp webhook: no job name")
		return nil
	}

	log.Debugfc(ctx, "geospatialjp webhook: prepare (cloud run jobs): %s", jobName)

	client, err := run.NewJobsClient(ctx)
	if err != nil {
		log.Debugfc(ctx, "geospatialjp webhook: failed to create run client: %v", err)
		return err
	}
	defer client.Close()

	overrides := runpb.RunJobRequest_Overrides{
		ContainerOverrides: []*runpb.RunJobRequest_Overrides_ContainerOverride{
			{Args: []string{
				"prepare-gspatialjp",
				"--city=" + itemID,
				"--project=" + projectID,
				"--wetrun",
			}},
		}}

	req := &runpb.RunJobRequest{
		Name:      jobName,
		Overrides: &overrides,
	}

	if _, err = client.RunJob(ctx, req); err != nil {
		log.Debugfc(ctx, "geospatialjp webhook: failed to run job: %v", err)
		return err
	}

	log.Debugfc(ctx, "geospatialjp webhook: run job: %v", req)
	return nil
}
