package main

import (
	"context"
	"os"
	"os/exec"

	"github.com/reearth/reearth-cms/worker/internal/infrastructure/gcp"
	"github.com/reearth/reearth-cms/worker/pkg/asset"
	"github.com/reearth/reearthx/log"
)

func main() {
	topic := os.Getenv("REEARTH_CMS_DECOMPRESSOR_TOPIC")
	project := os.Getenv("GOOGLE_CLOUD_PROJECT")
	assetID := os.Getenv("REEARTH_CMS_DECOMPRESSOR_ASSET_ID")

	pubsub := gcp.NewPubSub(topic, project)

	ctx := context.Background()

	cmd := exec.CommandContext(ctx, os.Args[1], os.Args[2:]...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	var status asset.ArchiveExtractionStatus
	if err := cmd.Run(); err == nil {
		status = asset.ArchiveExtractionStatusDone
	} else {
		status = asset.ArchiveExtractionStatusFailed
	}

	if err := pubsub.NotifyAssetDecompressed(ctx, assetID, &status); err != nil {
		log.Fatal("failed to notify asset decompressed: ", err)
	}

	if status == asset.ArchiveExtractionStatusFailed {
		os.Exit(1)
	}
}
