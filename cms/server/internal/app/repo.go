package app

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/auth0"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/aws"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/gcp"
	mongorepo "github.com/reearth/reearth-cms/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/spf13/afero"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
)

const databaseName = "reearth_cms"

func initReposAndGateways(ctx context.Context, conf *Config) (*repo.Container, *gateway.Container, *accountrepo.Container, *accountgateway.Container) {
	gateways := &gateway.Container{}
	acGateways := &accountgateway.Container{}

	// Mongo
	client, err := mongo.Connect(
		ctx,
		options.Client().
			ApplyURI(conf.DB).
			SetConnectTimeout(time.Second*10).
			SetMonitor(otelmongo.NewMonitor()),
	)
	if err != nil {
		log.Fatalf("repo initialization error: %+v\n", err)
	}

	accountDatabase := conf.DB_Account
	if accountDatabase == "" {
		accountDatabase = databaseName
	}

	accountUsers := make([]accountrepo.User, 0, len(conf.DB_Users))
	for _, u := range conf.DB_Users {
		c, err := mongo.Connect(ctx, options.Client().ApplyURI(u.URI).SetMonitor(otelmongo.NewMonitor()))
		if err != nil {
			log.Fatalf("mongo error: %+v\n", err)
		}
		accountUsers = append(accountUsers, accountmongo.NewUserWithHost(mongox.NewClient(accountDatabase, c), u.Name))
	}

	txAvailable := mongox.IsTransactionAvailable(conf.DB)

	acRepos, err := accountmongo.New(ctx, client, accountDatabase, txAvailable, false, accountUsers)
	if err != nil {
		log.Fatalf("Failed to init mongo: %+v\n", err)
	}

	repos, err := mongorepo.New(ctx, client, databaseName, txAvailable, acRepos)
	if err != nil {
		log.Fatalf("Failed to init mongo: %+v\n", err)
	}
	// File
	var fileRepo gateway.File
	if conf.GCS.BucketName != "" {
		log.Infof("file: GCS storage is used: %s", conf.GCS.BucketName)
		fileRepo, err = gcp.NewFile(conf.GCS.BucketName, conf.AssetBaseURL, conf.GCS.PublicationCacheControl)
		if err != nil {
			log.Fatalf("file: failed to init GCS storage: %s\n", err.Error())
		}
	} else if conf.S3.BucketName != "" {
		log.Infof("file: S3 storage is used: %s", conf.S3.BucketName)
		fileRepo, err = aws.NewFile(ctx, conf.S3.BucketName, conf.AssetBaseURL, conf.S3.PublicationCacheControl)
		if err != nil {
			log.Fatalf("file: failed to init S3 storage: %s\n", err.Error())
		}
	} else {
		log.Infoc(ctx, "file: local storage is used")
		datafs := afero.NewBasePathFs(afero.NewOsFs(), "data")
		fileRepo, err = fs.NewFile(datafs, conf.AssetBaseURL)
	}
	if err != nil {
		log.Fatalc(ctx, fmt.Sprintf("file: init error: %+v", err))
	}
	gateways.File = fileRepo

	// Auth0
	auth := auth0.New(conf.Auth0.Domain, conf.Auth0.ClientID, conf.Auth0.ClientSecret)
	gateways.Authenticator = auth
	acGateways.Authenticator = auth

	// CloudTasks
	if conf.Task.GCPProject != "" {
		conf.Task.GCSHost = conf.Host
		conf.Task.GCSBucket = conf.GCS.BucketName
		taskRunner, err := gcp.NewTaskRunner(ctx, &conf.Task)
		if err != nil {
			log.Fatalc(ctx, fmt.Sprintf("task runner: gcp init error: %+v", err))
		}
		gateways.TaskRunner = taskRunner
		log.Infofc(ctx, "task runner: GCP is used")
	} else if conf.AWSTask.TopicARN != "" || conf.AWSTask.WebhookARN != "" {
		taskRunner, err := aws.NewTaskRunner(ctx, &conf.AWSTask)
		if err != nil {
			log.Fatalc(ctx, fmt.Sprintf("task runner: aws init error: %+v", err))
		}
		gateways.TaskRunner = taskRunner
		log.Infofc(ctx, "task runner: AWS is used")
	} else {
		log.Infofc(ctx, "task runner: not used")
	}

	return repos, gateways, acRepos, acGateways
}
