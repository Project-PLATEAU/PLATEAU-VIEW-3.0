package mongodoc

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/idx"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewRequest(t *testing.T) {
	now := time.Now()
	rId, pId, uId, wId, tId := request.NewID(), project.NewID(), user.NewID(), user.NewWorkspaceID(), thread.NewID()
	itm, _ := request.NewItem(item.NewID())
	tests := []struct {
		name   string
		r      *request.Request
		want   *RequestDocument
		rDocId string
	}{
		{
			name: "new",
			r: request.New().ID(rId).Project(pId).Workspace(wId).Thread(tId).CreatedBy(uId).
				Title("ab").Description("abc").
				UpdatedAt(now).State(request.StateDraft).
				Items([]*request.Item{itm}).
				MustBuild(),
			want: &RequestDocument{
				ID:        rId.String(),
				Workspace: wId.String(),
				Project:   pId.String(),
				Items: []RequestItem{{
					Item:    itm.Item().String(),
					Version: nil,
					Ref:     lo.ToPtr(version.Public.String()),
				}},
				Title:       "ab",
				Description: "abc",
				CreatedBy:   uId.String(),
				Reviewers:   []string{},
				State:       request.StateDraft.String(),
				UpdatedAt:   now,
				ApprovedAt:  nil,
				ClosedAt:    nil,
				Thread:      tId.String(),
			},
			rDocId: rId.String(),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, rDocId := NewRequest(tt.r)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.rDocId, rDocId)
		})
	}
}

func TestNewRequestConsumer(t *testing.T) {
	c := NewRequestConsumer()
	assert.NotNil(t, c)
}

func TestNewRequests(t *testing.T) {
	now := time.Now()
	rId, pId, uId, wId, tId := request.NewID(), project.NewID(), user.NewID(), user.NewWorkspaceID(), thread.NewID()
	itm, _ := request.NewItem(item.NewID())
	tests := []struct {
		name     string
		requests request.List
		want     []*RequestDocument
		rDocsIds []string
	}{
		{
			name: "new",
			requests: []*request.Request{
				request.New().ID(rId).Project(pId).Workspace(wId).Thread(tId).CreatedBy(uId).
					Title("ab").Description("abc").
					UpdatedAt(now).State(request.StateDraft).
					Items([]*request.Item{itm}).
					MustBuild(),
			},
			want: []*RequestDocument{
				{
					ID:        rId.String(),
					Workspace: wId.String(),
					Project:   pId.String(),
					Items: []RequestItem{{
						Item:    itm.Item().String(),
						Version: nil,
						Ref:     lo.ToPtr(version.Public.String()),
					}},
					Title:       "ab",
					Description: "abc",
					CreatedBy:   uId.String(),
					Reviewers:   []string{},
					State:       request.StateDraft.String(),
					UpdatedAt:   now,
					ApprovedAt:  nil,
					ClosedAt:    nil,
					Thread:      tId.String(),
				},
			},
			rDocsIds: []string{rId.String()},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, rDocsIds := NewRequests(tt.requests)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.rDocsIds, rDocsIds)
		})
	}
}

func TestRequestDocument_Model(t *testing.T) {
	now := time.Now()
	rId, pId, uId, wId, tId := request.NewID(), project.NewID(), user.NewID(), user.NewWorkspaceID(), thread.NewID()
	itm, _ := request.NewItem(item.NewID())
	uuId := uuid.New()
	tests := []struct {
		name    string
		rDoc    *RequestDocument
		want    *request.Request
		wantErr bool
	}{
		{
			name: "model with ref",
			rDoc: &RequestDocument{
				ID:        rId.String(),
				Workspace: wId.String(),
				Project:   pId.String(),
				Items: []RequestItem{{
					Item:    itm.Item().String(),
					Version: nil,
					Ref:     lo.ToPtr(version.Public.String()),
				}},
				Title:       "ab",
				Description: "abc",
				CreatedBy:   uId.String(),
				Reviewers:   []string{},
				State:       request.StateDraft.String(),
				UpdatedAt:   now,
				ApprovedAt:  nil,
				ClosedAt:    nil,
				Thread:      tId.String(),
			},
			want: request.New().ID(rId).Project(pId).Workspace(wId).Thread(tId).CreatedBy(uId).
				Title("ab").Description("abc").
				UpdatedAt(now).State(request.StateDraft).Reviewers([]idx.ID[accountdomain.User]{}).
				Items([]*request.Item{itm}).
				MustBuild(),
			wantErr: false,
		},
		{
			name: "model with version",
			rDoc: &RequestDocument{
				ID:        rId.String(),
				Workspace: wId.String(),
				Project:   pId.String(),
				Items: []RequestItem{{
					Item:    itm.Item().String(),
					Version: lo.ToPtr(uuId.String()),
					Ref:     nil,
				}},
				Title:       "ab",
				Description: "abc",
				CreatedBy:   uId.String(),
				Reviewers:   []string{},
				State:       request.StateDraft.String(),
				UpdatedAt:   now,
				ApprovedAt:  nil,
				ClosedAt:    nil,
				Thread:      tId.String(),
			},
			want: request.New().ID(rId).Project(pId).Workspace(wId).Thread(tId).CreatedBy(uId).
				Title("ab").Description("abc").
				UpdatedAt(now).State(request.StateDraft).Reviewers([]idx.ID[accountdomain.User]{}).
				Items([]*request.Item{lo.Must(request.NewItemWithVersion(itm.Item(), version.Version(uuId).OrRef()))}).
				MustBuild(),
			wantErr: false,
		},
		{
			name: "invalid id 1",
			rDoc: &RequestDocument{
				ID:        "abc",
				Workspace: wId.String(),
				Project:   pId.String(),
				Items: []RequestItem{{
					Item:    itm.Item().String(),
					Version: nil,
					Ref:     lo.ToPtr(version.Public.String()),
				}},
				Title:       "ab",
				Description: "abc",
				CreatedBy:   uId.String(),
				Reviewers:   []string{},
				State:       request.StateDraft.String(),
				UpdatedAt:   now,
				ApprovedAt:  nil,
				ClosedAt:    nil,
				Thread:      tId.String(),
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id 2",
			rDoc: &RequestDocument{
				ID:        rId.String(),
				Workspace: "abc",
				Project:   pId.String(),
				Items: []RequestItem{{
					Item:    itm.Item().String(),
					Version: nil,
					Ref:     lo.ToPtr(version.Public.String()),
				}},
				Title:       "ab",
				Description: "abc",
				CreatedBy:   uId.String(),
				Reviewers:   []string{},
				State:       request.StateDraft.String(),
				UpdatedAt:   now,
				ApprovedAt:  nil,
				ClosedAt:    nil,
				Thread:      tId.String(),
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id 3",
			rDoc: &RequestDocument{
				ID:        rId.String(),
				Workspace: wId.String(),
				Project:   "abc",
				Items: []RequestItem{{
					Item:    itm.Item().String(),
					Version: nil,
					Ref:     lo.ToPtr(version.Public.String()),
				}},
				Title:       "ab",
				Description: "abc",
				CreatedBy:   uId.String(),
				Reviewers:   []string{},
				State:       request.StateDraft.String(),
				UpdatedAt:   now,
				ApprovedAt:  nil,
				ClosedAt:    nil,
				Thread:      tId.String(),
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id 4",
			rDoc: &RequestDocument{
				ID:        rId.String(),
				Workspace: wId.String(),
				Project:   pId.String(),
				Items: []RequestItem{{
					Item:    itm.Item().String(),
					Version: nil,
					Ref:     lo.ToPtr(version.Public.String()),
				}},
				Title:       "ab",
				Description: "abc",
				CreatedBy:   "abc",
				Reviewers:   []string{},
				State:       request.StateDraft.String(),
				UpdatedAt:   now,
				ApprovedAt:  nil,
				ClosedAt:    nil,
				Thread:      tId.String(),
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id 5",
			rDoc: &RequestDocument{
				ID:        rId.String(),
				Workspace: wId.String(),
				Project:   pId.String(),
				Items: []RequestItem{{
					Item:    itm.Item().String(),
					Version: nil,
					Ref:     lo.ToPtr(version.Public.String()),
				}},
				Title:       "ab",
				Description: "abc",
				CreatedBy:   uId.String(),
				Reviewers:   []string{},
				State:       request.StateDraft.String(),
				UpdatedAt:   now,
				ApprovedAt:  nil,
				ClosedAt:    nil,
				Thread:      "abc",
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id 6",
			rDoc: &RequestDocument{
				ID:        rId.String(),
				Workspace: wId.String(),
				Project:   pId.String(),
				Items: []RequestItem{{
					Item:    itm.Item().String(),
					Version: nil,
					Ref:     lo.ToPtr(version.Public.String()),
				}},
				Title:       "ab",
				Description: "abc",
				CreatedBy:   uId.String(),
				Reviewers:   []string{"abc"},
				State:       request.StateDraft.String(),
				UpdatedAt:   now,
				ApprovedAt:  nil,
				ClosedAt:    nil,
				Thread:      tId.String(),
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id 7",
			rDoc: &RequestDocument{
				ID:        rId.String(),
				Workspace: wId.String(),
				Project:   pId.String(),
				Items: []RequestItem{{
					Item:    "abc",
					Version: nil,
					Ref:     lo.ToPtr(version.Public.String()),
				}},
				Title:       "ab",
				Description: "abc",
				CreatedBy:   uId.String(),
				Reviewers:   []string{},
				State:       request.StateDraft.String(),
				UpdatedAt:   now,
				ApprovedAt:  nil,
				ClosedAt:    nil,
				Thread:      tId.String(),
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid version",
			rDoc: &RequestDocument{
				ID:        rId.String(),
				Workspace: wId.String(),
				Project:   pId.String(),
				Items: []RequestItem{{
					Item:    itm.Item().String(),
					Version: lo.ToPtr("abc"),
					Ref:     nil,
				}},
				Title:       "ab",
				Description: "abc",
				CreatedBy:   uId.String(),
				Reviewers:   []string{},
				State:       request.StateDraft.String(),
				UpdatedAt:   now,
				ApprovedAt:  nil,
				ClosedAt:    nil,
				Thread:      tId.String(),
			},
			want:    nil,
			wantErr: true,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.rDoc.Model()
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}
