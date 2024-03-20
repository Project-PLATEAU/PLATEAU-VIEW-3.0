package app

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"

	"github.com/reearth/reearthx/log"
)

const configPrefix = "REEARTH_CMS_WORKER"

type Config struct {
	Port       string `default:"8080" envconfig:"PORT"`
	ServerHost string
	Dev        bool
	GCS        GCSConfig
	S3         S3Config
	PubSub     PubSubConfig
	SNS        SNSConfig
	GCP        GCPConfig `envconfig:"GCP"`
	DB         string
}

type GCSConfig struct {
	BucketName              string `envconfig:"GCS_BUCKET_NAME"`
	AssetBaseURL            string `envconfig:"GCS_ASSET_BASE_URL"`
	PublicationCacheControl string
}

type S3Config struct {
	BucketName              string `envconfig:"S3_BUCKET_NAME"`
	AssetBaseURL            string `envconfig:"S3_ASSET_BASE_URL"`
	PublicationCacheControl string
}

type GCPConfig struct {
	Project string
}

type PubSubConfig struct {
	Topic string `default:"decompress"`
}

type SNSConfig struct {
	TopicARN string
}

func ReadConfig(debug bool) (*Config, error) {
	if err := godotenv.Load(".env"); err != nil && !os.IsNotExist(err) {
		return nil, err
	} else if err == nil {
		log.Infof("config: .env loaded")
	}

	var c Config
	err := envconfig.Process(configPrefix, &c)

	if debug {
		c.Dev = true
	}

	return &c, err
}
