package aws

import (
	"context"
	"net/url"
	"path"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestFile_GetURL(t *testing.T) {
	ctx := context.TODO()
	bucket := "asset.cms.test"
	host := "https://localhost:8080"
	r, err := NewFile(ctx, bucket, host, "")
	assert.NoError(t, err)

	u := newUUID()
	n := "xxx.yyy"
	a := asset.New().NewID().
		Project(id.NewProjectID()).
		CreatedByUser(accountdomain.NewUserID()).
		Size(1000).
		FileName(n).
		UUID(u).
		Thread(id.NewThreadID()).
		MustBuild()

	expected, err := url.JoinPath(host, s3AssetBasePath, u[:2], u[2:], n)
	assert.NoError(t, err)
	actual := r.GetURL(a)
	assert.Equal(t, expected, actual)
}

func TestFile_GetS3ObjectPath(t *testing.T) {
	u := newUUID()
	n := "xxx.yyy"
	assert.Equal(t, path.Join(s3AssetBasePath, u[:2], u[2:], "xxx.yyy"), getS3ObjectPath(u, n))

	n = "ああああ.yyy"
	assert.Equal(t, path.Join(s3AssetBasePath, u[:2], u[2:], "ああああ.yyy"), getS3ObjectPath(u, n))

	assert.Equal(t, "", getS3ObjectPath("", ""))
}

func TestFile_IsValidUUID(t *testing.T) {
	u := newUUID()
	assert.Equal(t, true, isValidUUID(u))

	u1 := "xxxxxx"
	assert.Equal(t, false, isValidUUID(u1))
}
