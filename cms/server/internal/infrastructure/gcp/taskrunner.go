package gcp

import (
	"context"
	"fmt"
	"net/url"
	"path"

	"cloud.google.com/go/pubsub"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"google.golang.org/api/cloudbuild/v1"
)

type TaskRunner struct {
	conf   *TaskConfig
	pubsub *pubsub.Client
}

func NewTaskRunner(ctx context.Context, conf *TaskConfig) (gateway.TaskRunner, error) {
	pubsub, err := pubsub.NewClient(ctx, conf.GCPProject)
	if err != nil {
		return nil, err
	}

	return &TaskRunner{
		conf:   conf,
		pubsub: pubsub,
	}, nil
}

// Run implements gateway.TaskRunner
func (t *TaskRunner) Run(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return t.runCloudBuild(ctx, p)
	}
	return t.runPubSub(ctx, p)
}

func (t *TaskRunner) Retry(ctx context.Context, id string) error {
	cb, err := cloudbuild.NewService(ctx)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	project := t.conf.GCPProject
	region := t.conf.GCPRegion

	req := &cloudbuild.RetryBuildRequest{
		Id:        id,
		ProjectId: project,
	}

	if region != "" {
		name := path.Join("projects", project, "locations", region, "builds", id)
		call := cb.Projects.Locations.Builds.Retry(name, req)
		_, err = call.Do()
	} else {
		call := cb.Projects.Builds.Retry(project, id, req)
		_, err = call.Do()
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (t *TaskRunner) runCloudBuild(ctx context.Context, p task.Payload) error {
	if p.DecompressAsset == nil {
		return nil
	}

	cb, err := cloudbuild.NewService(ctx)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	src, err := url.JoinPath("gs://"+t.conf.GCSBucket, "assets", p.DecompressAsset.Path)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	dest, err := url.JoinPath("gs://"+t.conf.GCSBucket, "assets", path.Dir(p.DecompressAsset.Path))
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	project := t.conf.GCPProject
	region := t.conf.GCPRegion

	machineType := ""
	if v := t.conf.DecompressorMachineType; v != "default" {
		machineType = v
	}

	build := &cloudbuild.Build{
		Timeout:  "86400s", // 1 day
		QueueTtl: "86400s", // 1 day
		Steps: []*cloudbuild.BuildStep{
			{
				Name: t.conf.DecompressorImage,
				Args: []string{"-v", "-n=192", "-gc=5000", "-chunk=1m", "-disk-limit=20g", "-gzip-ext=" + t.conf.DecompressorGzipExt, "-skip-top", "-old-windows", src, dest},
				Env: []string{
					"GOOGLE_CLOUD_PROJECT=" + project,
					"REEARTH_CMS_DECOMPRESSOR_TOPIC=" + t.conf.DecompressorTopic,
					"REEARTH_CMS_DECOMPRESSOR_ASSET_ID=" + p.DecompressAsset.AssetID,
				},
			},
		},
		Options: &cloudbuild.BuildOptions{
			MachineType: machineType,
		},
	}

	if region != "" {
		call := cb.Projects.Locations.Builds.Create(path.Join("projects", project, "locations", region), build)
		_, err = call.Do()
	} else {
		call := cb.Projects.Builds.Create(project, build)
		_, err = call.Do()
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (t *TaskRunner) runPubSub(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return nil
	}

	u, err := url.Parse(t.conf.GCSHost)
	if err != nil {
		return fmt.Errorf("failed to parse GCS host as a URL: %w", err)
	}

	var urlFn asset.URLResolver = func(a *asset.Asset) string {
		return getURL(u, a.UUID(), a.FileName())
	}

	data, err := marshalWebhookData(p.Webhook, urlFn)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	topic := t.pubsub.Topic(t.conf.Topic)
	result := topic.Publish(ctx, &pubsub.Message{
		Data: data,
	})
	log.Infof("webhook request has been sent: body %#v", p.Webhook.Payload().Webhook)

	if _, err := result.Get(ctx); err != nil {
		return rerror.ErrInternalBy(err)
	}

	return nil
}
