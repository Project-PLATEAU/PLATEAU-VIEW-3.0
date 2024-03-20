package mongodoc

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/stretchr/testify/assert"
)

func TestAssetDocument_Model(t *testing.T) {
	now := time.Now()
	aId, pId, uId, tId := asset.NewID(), project.NewID(), user.NewID(), thread.NewID()
	uuId := uuid.New()
	tests := []struct {
		name    string
		aDoc    *AssetDocument
		want    *asset.Asset
		wantErr bool
	}{
		{
			name: "model",
			aDoc: &AssetDocument{
				ID:                      aId.String(),
				Project:                 pId.String(),
				CreatedAt:               now,
				User:                    uId.StringRef(),
				Integration:             nil,
				FileName:                "",
				Size:                    123,
				PreviewType:             "",
				UUID:                    uuId.String(),
				Thread:                  tId.String(),
				ArchiveExtractionStatus: "",
			},
			want:    asset.New().ID(aId).Project(pId).CreatedByUser(uId).CreatedAt(now).Thread(tId).UUID(uuId.String()).Size(123).MustBuild(),
			wantErr: false,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.aDoc.Model()
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewAsset(t *testing.T) {
	now := time.Now()
	aId, pId, uId, tId := asset.NewID(), project.NewID(), user.NewID(), thread.NewID()
	uuId := uuid.New()
	tests := []struct {
		name   string
		a      *asset.Asset
		want   *AssetDocument
		aDocId string
	}{
		{
			name: "new",
			a:    asset.New().ID(aId).Project(pId).CreatedByUser(uId).CreatedAt(now).Thread(tId).UUID(uuId.String()).Size(123).MustBuild(),
			want: &AssetDocument{
				ID:                      aId.String(),
				Project:                 pId.String(),
				CreatedAt:               now,
				User:                    uId.StringRef(),
				Integration:             nil,
				FileName:                "",
				Size:                    123,
				PreviewType:             "",
				UUID:                    uuId.String(),
				Thread:                  tId.String(),
				ArchiveExtractionStatus: "",
			},
			aDocId: aId.String(),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			got, aDocId := NewAsset(tt.a)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.aDocId, aDocId)
		})
	}
}

func TestNewAssetConsumer(t *testing.T) {
	c := NewAssetConsumer()
	assert.NotNil(t, c)
}

func TestAssetFileDocument_Model(t *testing.T) {
	tests := []struct {
		name  string
		afDoc *AssetFileDocument
		want  *asset.File
	}{
		{
			name: "model",
			afDoc: &AssetFileDocument{
				Name:        "abc",
				Size:        123,
				ContentType: "text",
				Path:        "/",
				Children:    []*AssetFileDocument{},
			},
			want: asset.NewFile().Name("abc").ContentType("text").Size(123).Path("/").Build(),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.afDoc.Model()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewFile(t *testing.T) {
	tests := []struct {
		name string
		f    *asset.File
		want *AssetFileDocument
	}{
		{
			name: "new",
			f:    asset.NewFile().Name("abc").ContentType("text").Size(123).Path("/").Build(),
			want: &AssetFileDocument{
				Name:        "abc",
				Size:        123,
				ContentType: "text",
				Path:        "/",
				Children:    []*AssetFileDocument{},
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			got := NewFile(tt.f)
			assert.Equal(t, tt.want, got)
		})
	}
}
