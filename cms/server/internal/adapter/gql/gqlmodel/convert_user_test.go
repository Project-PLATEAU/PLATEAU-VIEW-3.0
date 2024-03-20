package gqlmodel

import (
	"testing"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/idx"
	"github.com/stretchr/testify/assert"
)

func TestToWorkspace(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	uid := accountdomain.NewUserID()
	iid := accountdomain.NewIntegrationID()
	roleOwner := workspace.Member{
		Role:      workspace.RoleOwner,
		InvitedBy: uid,
	}
	w := workspace.New().ID(wid).
		Name("workspace").
		Members(map[idx.ID[accountdomain.User]]workspace.Member{
			uid: roleOwner,
		}).
		Integrations(map[idx.ID[accountdomain.Integration]]workspace.Member{
			iid: roleOwner,
		}).
		MustBuild()
	tests := []struct {
		name string
		arg  *workspace.Workspace
		want *Workspace
	}{
		{
			name: "ok",
			arg:  w,
			want: &Workspace{
				ID:   IDFrom(w.ID()),
				Name: "workspace",
				Members: []WorkspaceMember{
					&WorkspaceUserMember{
						UserID: IDFrom(uid),
						Role:   ToRole(workspace.RoleOwner),
					},
					&WorkspaceIntegrationMember{
						IntegrationID: IDFrom(iid),
						Role:          ToRole(workspace.RoleOwner),
						Active:        true,
						InvitedByID:   IDFrom(uid),
						InvitedBy:     nil,
						Integration:   nil,
					},
				},
			},
		},
		{
			name: "nil",
			arg:  nil,
			want: nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, ToWorkspace(tt.arg))
		})
	}
}

func TestToRole(t *testing.T) {
	tests := []struct {
		name string
		arg  workspace.Role
		want Role
	}{
		{
			name: "RoleOwner",
			arg:  workspace.RoleOwner,
			want: RoleOwner,
		},
		{
			name: "RoleMaintainer",
			arg:  workspace.RoleMaintainer,
			want: RoleMaintainer,
		},
		{
			name: "RoleWriter",
			arg:  workspace.RoleWriter,
			want: RoleWriter,
		},
		{
			name: "RoleReader",
			arg:  workspace.RoleReader,
			want: RoleReader,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			tt := tt
			t.Parallel()

			assert.Equal(t, tt.want, ToRole(tt.arg))
		})
	}
}

func TestFromRole(t *testing.T) {
	tests := []struct {
		name string
		arg  Role
		want workspace.Role
	}{
		{
			name: "RoleOwner",
			arg:  RoleOwner,
			want: workspace.RoleOwner,
		},
		{
			name: "RoleMaintainer",
			arg:  RoleMaintainer,
			want: workspace.RoleMaintainer,
		},
		{
			name: "RoleWriter",
			arg:  RoleWriter,
			want: workspace.RoleWriter,
		},
		{
			name: "RoleReader",
			arg:  RoleReader,
			want: workspace.RoleReader,
		},
		{
			name: "Blank",
			arg:  Role(""),
			want: workspace.Role(""),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			tt := tt
			t.Parallel()

			assert.Equal(t, tt.want, FromRole(tt.arg))
		})
	}
}
