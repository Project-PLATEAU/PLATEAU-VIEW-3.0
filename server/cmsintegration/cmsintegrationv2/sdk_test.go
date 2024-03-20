package cmsintegrationv2

import (
	"context"
	"testing"

	"github.com/jarcoal/httpmock"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/stretchr/testify/assert"
)

func TestServices_RequestMaxLODExtraction(t *testing.T) {
	ctx := context.Background()
	s := Services{
		CMS:       &cmsMock{},
		FME:       &fmeMock{},
		FMESecret: "secret",
	}

	project := "project_id"
	item := Item{
		ID:           "id",
		CityGML:      "citygml",
		MaxLOD:       "max_lod",
		MaxLODStatus: StatusOK,
	}

	s.RequestMaxLODExtraction(ctx, item, project, false)

	assert.Nil(t, s.CMS.(*cmsMock).AssetCalls)
	assert.Nil(t, s.CMS.(*cmsMock).UpdateItemCalls)
	assert.Nil(t, s.FME.(*fmeMock).RequestCalls)

	s.RequestMaxLODExtraction(ctx, item, project, true)

	assert.Equal(t, []string{"citygml"}, s.CMS.(*cmsMock).AssetCalls)
	assert.Equal(t, []struct {
		ID     string
		Fields []*cms.Field
	}{{
		ID: "id",
		Fields: []*cms.Field{
			{
				Key:   "max_lod_status",
				Type:  "select",
				Value: StatusProcessing,
			},
		},
	}}, s.CMS.(*cmsMock).UpdateItemCalls)
	assert.Equal(t, []fmeRequest{
		maxLODRequest{
			ID: fmeID{
				ItemID:    "id",
				AssetID:   "citygml",
				ProjectID: "project_id",
			}.String("secret"),
			Target: "https://example.com/citygml.zip",
		},
	}, s.FME.(*fmeMock).RequestCalls)
}

func TestServices_ReceiveFMEResult(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()
	httpmock.RegisterResponder("GET", "https://example.com/result.csv",
		httpmock.NewStringResponder(200, "a,b,c,d\naaa,bbb,ccc,ddd\n1,2,3,4\n1,dem,3,4\n"))

	s := &Services{
		CMS:       &cmsMock{},
		FMESecret: "secret",
	}

	err := s.receiveMaxLODExtractionResult(context.Background(), fmeResult{
		ID: fmeID{
			ItemID:    "id",
			AssetID:   "citygml",
			ProjectID: "project_id",
		}.String("secret"),
		ResultURL: "https://example.com/result.csv",
	})
	assert.NoError(t, err)

	assert.Equal(t, []struct {
		ProjectID string
		URL       string
	}{{
		ProjectID: "project_id",
		URL:       "https://example.com/result.csv",
	}}, s.CMS.(*cmsMock).UploadAssetCalls)

	assert.Equal(t, []struct {
		ID     string
		Fields []*cms.Field
	}{{
		ID: "id",
		Fields: []*cms.Field{
			{
				Key:   "max_lod",
				Type:  "asset",
				Value: "asset_id",
			},
			{
				Key:   "max_lod_status",
				Type:  "select",
				Value: StatusOK,
			},
			{
				Key:   "dem",
				Type:  "select",
				Value: "有り",
			},
		},
	}}, s.CMS.(*cmsMock).UpdateItemCalls)
}

func TestIsDemIncludedInCSV(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "https://example.com/csv",
		httpmock.NewStringResponder(200, "a,b,c,d\naaa,bbb,ccc,ddd\n1,2,3,4\n"))
	httpmock.RegisterResponder("GET", "https://example.com/csv2",
		httpmock.NewStringResponder(200, "a,b,c,d\naaa,bbb,ccc,ddd\n1,2,3,4\n1,dem,3,4\n"))

	res, err := isDemIncludedInCSV("https://example.com/csv")
	assert.NoError(t, err)
	assert.False(t, res)

	res, err = isDemIncludedInCSV("https://example.com/csv2")
	assert.NoError(t, err)
	assert.True(t, res)
}

type cmsMock struct {
	cms.Interface
	GetItemCalls    []string
	AssetCalls      []string
	UpdateItemCalls []struct {
		ID     string
		Fields []*cms.Field
	}
	UploadAssetCalls []struct {
		ProjectID string
		URL       string
	}
}

func (m *cmsMock) GetItem(ctx context.Context, id string, asset bool) (*cms.Item, error) {
	m.GetItemCalls = append(m.GetItemCalls, id)
	return &cms.Item{
		ID: id,
		Fields: []*cms.Field{
			{
				Key:   "citygml",
				Type:  "asset",
				Value: "citygml",
			},
			{
				Key:   "max_lod_status",
				Type:  "select",
				Value: string(StatusReady),
			},
		},
	}, nil
}

func (m *cmsMock) Asset(ctx context.Context, id string) (*cms.Asset, error) {
	m.AssetCalls = append(m.AssetCalls, id)
	return &cms.Asset{
		ID:  id,
		URL: "https://example.com/citygml.zip",
	}, nil
}

func (m *cmsMock) UpdateItem(ctx context.Context, id string, fields []*cms.Field, metadataFields []*cms.Field) (*cms.Item, error) {
	m.UpdateItemCalls = append(m.UpdateItemCalls, struct {
		ID     string
		Fields []*cms.Field
	}{ID: id, Fields: fields})
	return nil, nil
}

func (m *cmsMock) UploadAsset(ctx context.Context, projectID string, url string) (string, error) {
	m.UploadAssetCalls = append(m.UploadAssetCalls, struct {
		ProjectID string
		URL       string
	}{
		ProjectID: projectID,
		URL:       url,
	})
	return "asset_id", nil
}

type fmeMock struct {
	RequestCalls []fmeRequest
}

func (m *fmeMock) Request(ctx context.Context, req fmeRequest) error {
	m.RequestCalls = append(m.RequestCalls, req)
	return nil
}
