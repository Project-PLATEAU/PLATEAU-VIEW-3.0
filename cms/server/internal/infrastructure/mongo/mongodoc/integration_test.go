package mongodoc

import (
	"net/url"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestIntegrationDocument_Model(t *testing.T) {
	now := time.Now()
	iId := integration.NewID()
	uId := user.NewID()
	tests := []struct {
		name    string
		iDoc    *IntegrationDocument
		want    *integration.Integration
		wantErr bool
	}{
		{
			name: "",
			iDoc: &IntegrationDocument{
				ID:          iId.String(),
				Name:        "abc",
				Description: "xyz",
				LogoUrl:     "https://huho.com/xzy",
				Type:        "public",
				Token:       "xxx123",
				Developer:   uId.String(),
				Webhook:     nil,
				UpdatedAt:   now,
			},
			want: integration.New().
				ID(iId).
				Name("abc").
				Description("xyz").
				Type(integration.TypePublic).
				Token("xxx123").
				Developer(uId).
				UpdatedAt(now).
				Webhook([]*integration.Webhook{}).
				LogoUrl(lo.Must(url.Parse("https://huho.com/xzy"))).
				MustBuild(),
			wantErr: false,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.iDoc.Model()
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equalf(t, tt.want, got, "Model()")
		})
	}
}

func TestNewIntegration(t *testing.T) {
	now := time.Now()
	iId := integration.NewID()
	uId := user.NewID()
	tests := []struct {
		name   string
		i      *integration.Integration
		want   *IntegrationDocument
		iDocId string
	}{
		{
			name: "",
			i: integration.New().
				ID(iId).
				Name("abc").
				Description("xyz").
				Type(integration.TypePublic).
				Token("xxx123").
				Developer(uId).
				UpdatedAt(now).
				Webhook([]*integration.Webhook{}).
				LogoUrl(lo.Must(url.Parse("https://huho.com/xzy"))).
				MustBuild(),
			want: &IntegrationDocument{
				ID:          iId.String(),
				Name:        "abc",
				Description: "xyz",
				LogoUrl:     "https://huho.com/xzy",
				Type:        "public",
				Token:       "xxx123",
				Developer:   uId.String(),
				Webhook:     []WebhookDocument{},
				UpdatedAt:   now,
			},
			iDocId: iId.String(),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, iDocId := NewIntegration(tt.i)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.iDocId, iDocId)
		})
	}
}

func TestNewIntegrationConsumer(t *testing.T) {
	c := NewIntegrationConsumer()
	assert.NotNil(t, c)
}
