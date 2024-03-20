package mongodoc

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/stretchr/testify/assert"
)

func TestItemDocument_Model(t *testing.T) {
	iId, pId, sId, tId, mId, uId, gId := item.NewID(), project.NewID(), schema.NewID(), thread.NewID(), model.NewID(), user.NewID(), integration.NewID()
	upId, ipId, miId := user.NewID().Ref(), integration.NewID().Ref(), item.NewID().Ref()
	now := time.Now()
	tests := []struct {
		name    string
		iDoc    *ItemDocument
		want    *item.Item
		wantErr bool
	}{
		{
			name: "model",
			iDoc: &ItemDocument{
				ID:                   iId.String(),
				Project:              pId.String(),
				Schema:               sId.String(),
				Thread:               tId.String(),
				ModelID:              mId.String(),
				MetadataItem:         miId.StringRef(),
				UpdatedByUser:        upId.StringRef(),
				UpdatedByIntegration: ipId.StringRef(),
				Fields:               nil,
				Timestamp:            now,
				User:                 uId.StringRef(),
				Integration:          nil,
			},
			want:    item.New().ID(iId).Project(pId).Schema(sId).UpdatedByUser(upId).UpdatedByIntegration(ipId).MetadataItem(miId).Thread(tId).Model(mId).Timestamp(now).User(uId).MustBuild(),
			wantErr: false,
		},
		{
			name: "model",
			iDoc: &ItemDocument{
				ID:          iId.String(),
				Project:     pId.String(),
				Schema:      sId.String(),
				Thread:      tId.String(),
				ModelID:     mId.String(),
				Fields:      nil,
				Timestamp:   now,
				User:        nil,
				Integration: gId.StringRef(),
			},
			want:    item.New().ID(iId).Project(pId).Schema(sId).Thread(tId).Model(mId).Timestamp(now).Integration(gId).MustBuild(),
			wantErr: false,
		},
		{
			name: "invalid id 1",
			iDoc: &ItemDocument{
				ID:          "abc",
				Project:     pId.String(),
				Schema:      sId.String(),
				Thread:      tId.String(),
				ModelID:     mId.String(),
				Fields:      nil,
				Timestamp:   now,
				User:        uId.StringRef(),
				Integration: nil,
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id 2",
			iDoc: &ItemDocument{
				ID:          iId.String(),
				Project:     "abc",
				Schema:      sId.String(),
				Thread:      tId.String(),
				ModelID:     mId.String(),
				Fields:      nil,
				Timestamp:   now,
				User:        uId.StringRef(),
				Integration: nil,
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id 3",
			iDoc: &ItemDocument{
				ID:          iId.String(),
				Project:     pId.String(),
				Schema:      "abc",
				Thread:      tId.String(),
				ModelID:     mId.String(),
				Fields:      nil,
				Timestamp:   now,
				User:        uId.StringRef(),
				Integration: nil,
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id 4",
			iDoc: &ItemDocument{
				ID:          iId.String(),
				Project:     pId.String(),
				Schema:      sId.String(),
				Thread:      "abc",
				ModelID:     mId.String(),
				Fields:      nil,
				Timestamp:   now,
				User:        uId.StringRef(),
				Integration: nil,
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id 5",
			iDoc: &ItemDocument{
				ID:          iId.String(),
				Project:     pId.String(),
				Schema:      sId.String(),
				Thread:      tId.String(),
				ModelID:     "abc",
				Fields:      nil,
				Timestamp:   now,
				User:        uId.StringRef(),
				Integration: nil,
			},
			want:    nil,
			wantErr: true,
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
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewItem(t *testing.T) {
	iId, pId, sId, tId, mId, uId := item.NewID(), project.NewID(), schema.NewID(), thread.NewID(), model.NewID(), user.NewID()
	now := time.Now()
	tests := []struct {
		name   string
		i      *item.Item
		want   *ItemDocument
		iDocId string
	}{
		{
			name: "new",
			i:    item.New().ID(iId).Project(pId).Schema(sId).Thread(tId).Model(mId).Timestamp(now).User(uId).MustBuild(),
			want: &ItemDocument{
				ID:          iId.String(),
				Project:     pId.String(),
				Schema:      sId.String(),
				Thread:      tId.String(),
				ModelID:     mId.String(),
				Fields:      []ItemFieldDocument{},
				Timestamp:   now,
				User:        uId.StringRef(),
				Integration: nil,
				Assets:      []string{},
			},
			iDocId: iId.String(),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, iDocId := NewItem(tt.i)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.iDocId, iDocId)
		})
	}
}

func TestNewItemConsumer(t *testing.T) {
	c := NewItemConsumer()
	assert.NotNil(t, c)
}

func TestNewItems(t *testing.T) {
	iId, pId, sId, tId, mId, uId := item.NewID(), project.NewID(), schema.NewID(), thread.NewID(), model.NewID(), user.NewID()
	now := time.Now()
	tests := []struct {
		name     string
		items    item.List
		want     []*ItemDocument
		iDocsIds []string
	}{
		{
			name: "new arrat",
			items: item.List{
				item.New().ID(iId).Project(pId).Schema(sId).Thread(tId).Model(mId).Timestamp(now).User(uId).MustBuild(),
			},
			want: []*ItemDocument{
				{
					ID:          iId.String(),
					Project:     pId.String(),
					Schema:      sId.String(),
					Thread:      tId.String(),
					ModelID:     mId.String(),
					Fields:      []ItemFieldDocument{},
					Timestamp:   now,
					User:        uId.StringRef(),
					Integration: nil,
					Assets:      []string{},
				},
			},
			iDocsIds: []string{
				iId.String(),
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, iDocsIds := NewItems(tt.items)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.iDocsIds, iDocsIds)
		})
	}
}

func TestNewVersionedItemConsumer(t *testing.T) {
	c := NewVersionedItemConsumer()
	assert.NotNil(t, c)
}
