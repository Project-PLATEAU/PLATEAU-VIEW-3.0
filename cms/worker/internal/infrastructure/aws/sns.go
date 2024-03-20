package aws

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sns"
	"github.com/reearth/reearth-cms/worker/pkg/asset"
	"github.com/reearth/reearthx/log"
)

type SNS struct {
	snsClient *sns.Client
	topicArn  string
}

func NewSNS(ctx context.Context, topicArn string) (*SNS, error) {
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}

	snsClient := sns.NewFromConfig(cfg)

	return &SNS{
		snsClient: snsClient,
		topicArn:  topicArn,
	}, nil
}

func (s *SNS) NotifyAssetDecompressed(ctx context.Context, assetID string, status *asset.ArchiveExtractionStatus) error {
	message := map[string]string{
		"type":    "assetDecompressed",
		"assetId": assetID,
		"status":  status.String(),
	}

	body, err := json.Marshal(message)
	if err != nil {
		return err
	}

	publishInput := &sns.PublishInput{
		Message:  aws.String(string(body)),
		TopicArn: aws.String(s.topicArn),
	}

	_, err = s.snsClient.Publish(ctx, publishInput)
	if err != nil {
		return err
	}

	log.Infof("decompress notified via SNS: Msg=%s", string(body))
	return nil
}
