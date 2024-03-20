package geospatialjpv3

import (
	"context"
	"os"
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/ckan"
	"github.com/joho/godotenv"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestPublish(t *testing.T) {
	t.Skip()

	_ = godotenv.Load("../../../.env")

	var (
		indexItemID = ""
		dataItemID  = ""
		cmsURL      = os.Getenv("REEARTH_PLATEAUVIEW_CMS_BASEURL")
		cmsToken    = os.Getenv("REEARTH_PLATEAUVIEW_CMS_TOKEN")
		ckanOrg     = os.Getenv("REEARTH_PLATEAUVIEW_CKAN_ORG")
		ckanBaseURL = os.Getenv("REEARTH_PLATEAUVIEW_CKAN_BASEURL")
		ckanToken   = os.Getenv("REEARTH_PLATEAUVIEW_CKAN_TOKEN")
	)

	ctx := context.Background()

	item := &CityItem{
		CityCode:          "99999",
		CityName:          "テスト市",
		CityNameEn:        "test-shi",
		Year:              "2023",
		Spec:              "4",
		GeospatialjpIndex: indexItemID,
		GeospatialjpData:  dataItemID,
	}

	ckan, err := ckan.New(ckanBaseURL, ckanToken)
	assert.NoError(t, err)

	cms, err := cms.New(cmsURL, cmsToken)
	assert.NoError(t, err)

	h := &handler{
		cms:     cms,
		ckan:    ckan,
		ckanOrg: ckanOrg,
	}

	err = h.Publish(ctx, item)
	assert.NoError(t, err)
}

func TestShouldReorder(t *testing.T) {
	pkg := &ckan.Package{
		Resources: []ckan.Resource{
			{
				Name: "Resource 1 (v1)",
			},
			{
				Name: "Resource 2 (v2)",
			},
			{
				Name: "Resource 3 (v3)",
			},
		},
	}

	result := shouldReorder(pkg, 4)
	assert.True(t, result)

	result = shouldReorder(pkg, 2)
	assert.False(t, result)
}

func TestExtractVersionFromResourceName(t *testing.T) {
	name := "Resource 1（v1）"
	version := extractVersionFromResourceName(name)
	assert.Equal(t, lo.ToPtr(1), version)

	name = "Resource 2 (v20)"
	version = extractVersionFromResourceName(name)
	assert.Equal(t, lo.ToPtr(20), version)

	name = "Resource 3"
	version = extractVersionFromResourceName(name)
	assert.Nil(t, version)
}

func TestReplaceSize(t *testing.T) {
	assert.Equal(t, "aaa1 Bbbb", replaceSize("aaa${{SIZE}}bbb", 1))
	assert.Equal(t, "aaa1 Bbbb", replaceSize("aaa${{HOGE_SIZE}}bbb", 1))
	assert.Equal(t, "aaa1 Bbbb", replaceSize("aaa${{ HOGE_SIZE }}bbb", 1))
	assert.Equal(t, "aaa${HOGE_SIZE}bbb", replaceSize("aaa${HOGE_SIZE}bbb", 1))
}
