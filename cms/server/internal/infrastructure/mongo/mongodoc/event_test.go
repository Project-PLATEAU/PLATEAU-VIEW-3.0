package mongodoc

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestEventDocument_Model(t *testing.T) {
	now := time.Now().Truncate(time.Millisecond).UTC()
	eId, uId, pId, wId := event.NewID(), user.NewID(), project.NewID(), user.NewWorkspaceID()
	pDoc := &ProjectDocument{
		ID:          pId.String(),
		UpdatedAt:   now,
		Name:        "abc",
		Description: "xyz",
		Alias:       "ppp123",
		ImageURL:    "https://huho.com/xzy",
		Workspace:   wId.String(),
		Publication: &ProjectPublicationDocument{
			AssetPublic: true,
			Scope:       "public",
		},
	}
	tests := []struct {
		name    string
		eDoc    EventDocument
		want    *event.Event[any]
		wantErr bool
	}{
		{
			name: "test model",
			eDoc: EventDocument{
				ID:          eId.String(),
				Timestamp:   now,
				User:        lo.ToPtr(uId.String()),
				Integration: nil,
				Machine:     false,
				Type:        "item.create",
				Object: Document{
					Type:   "project",
					Object: lo.Must(bson.Marshal(pDoc)),
				},
			},
			want: event.New[any]().
				ID(eId).
				Type(event.ItemCreate).
				Timestamp(now).
				Operator(operator.OperatorFromUser(uId)).
				Object(lo.Must(pDoc.Model())).
				MustBuild(),
			wantErr: false,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.eDoc.Model()
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewEvent(t *testing.T) {
	now := time.Now().Truncate(time.Millisecond).UTC()
	eId, uId, pId, wId := event.NewID(), user.NewID(), project.NewID(), user.NewWorkspaceID()
	pDoc := &ProjectDocument{
		ID:          pId.String(),
		UpdatedAt:   now,
		Name:        "abc",
		Description: "xyz",
		Alias:       "ppp123",
		ImageURL:    "https://huho.com/xzy",
		Workspace:   wId.String(),
		Publication: &ProjectPublicationDocument{
			AssetPublic: true,
			Scope:       "public",
		},
	}
	tests := []struct {
		name    string
		e       *event.Event[any]
		want    *EventDocument
		eDocId  string
		wantErr bool
	}{
		{
			name: "",
			e: event.New[any]().
				ID(eId).
				Type(event.ItemCreate).
				Timestamp(now).
				Operator(operator.OperatorFromUser(uId)).
				Object(lo.Must(pDoc.Model())).
				MustBuild(),
			want: &EventDocument{
				ID:          eId.String(),
				Timestamp:   now,
				User:        lo.ToPtr(uId.String()),
				Integration: nil,
				Machine:     false,
				Type:        "item.create",
				Object: Document{
					Type:   "project",
					Object: lo.Must(bson.Marshal(pDoc)),
				},
			},
			eDocId:  eId.String(),
			wantErr: false,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, eDocId, err := NewEvent(tt.e)
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.eDocId, eDocId)
		})
	}
}

func TestNewEventConsumer(t *testing.T) {
	c := NewEventConsumer()
	assert.NotNil(t, c)
}
