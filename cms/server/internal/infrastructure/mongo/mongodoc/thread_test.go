package mongodoc

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/operator"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/account/accountdomain/user"

	"github.com/stretchr/testify/assert"
)

func TestComment_Model(t *testing.T) {
	cId := thread.NewCommentID()
	op := operator.OperatorFromUser(user.NewID())
	tests := []struct {
		name string
		cDoc *CommentDocument
		want *thread.Comment
	}{
		{
			name: "comment",
			cDoc: &CommentDocument{
				ID:          cId.String(),
				User:        op.User().StringRef(),
				Integration: nil,
				Content:     "abc",
			},
			want: thread.NewComment(cId, op, "abc"),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.cDoc.Model())
		})
	}
}

func TestThreadDocument_Model(t *testing.T) {
	tId, wId := thread.NewID(), user.NewWorkspaceID()
	tests := []struct {
		name    string
		tDoc    *ThreadDocument
		want    *thread.Thread
		wantErr bool
	}{
		{
			name: "model should pass",
			tDoc: &ThreadDocument{
				ID:        tId.String(),
				Workspace: wId.String(),
				Comments:  nil,
			},
			want:    thread.New().ID(tId).Workspace(wId).MustBuild(),
			wantErr: false,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.tDoc.Model()
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewComment(t *testing.T) {
	cId, uId := thread.NewCommentID(), user.NewID()

	op := operator.OperatorFromUser(uId)
	tests := []struct {
		name    string
		comment *thread.Comment
		want    *CommentDocument
	}{
		{
			name:    "new comment",
			comment: thread.NewComment(cId, op, "abc"),
			want: &CommentDocument{
				ID:          cId.String(),
				User:        uId.StringRef(),
				Integration: nil,
				Content:     "abc",
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewComment(tt.comment))
		})
	}
}

func TestNewThread(t *testing.T) {
	tId, wId := thread.NewID(), user.NewWorkspaceID()
	tests := []struct {
		name    string
		th      *thread.Thread
		want    *ThreadDocument
		thDocId string
	}{
		{
			name: "new",
			th:   thread.New().ID(tId).Workspace(wId).MustBuild(),
			want: &ThreadDocument{
				ID:        tId.String(),
				Workspace: wId.String(),
				Comments:  nil,
			},
			thDocId: tId.String(),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, got1 := NewThread(tt.th)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.thDocId, got1)
		})
	}
}

func TestNewThreadConsumer(t *testing.T) {
	c := NewThreadConsumer()
	assert.NotNil(t, c)
}
