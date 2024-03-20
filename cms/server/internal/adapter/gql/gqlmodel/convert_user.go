package gqlmodel

import (
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"

	"github.com/reearth/reearthx/util"
)

func SimpleToUser(u *user.Simple) *User {
	if u == nil {
		return nil
	}

	return &User{
		ID:    IDFrom(u.ID),
		Name:  u.Name,
		Email: u.Email,
		Host:  lo.EmptyableToPtr(u.Host),
	}
}

func ToUser(u *user.User) *User {
	if u == nil {
		return nil
	}

	return &User{
		ID:    IDFrom(u.ID()),
		Name:  u.Name(),
		Email: u.Email(),
		Host:  lo.EmptyableToPtr(u.Host()),
	}
}

func ToMe(u *user.User) *Me {
	if u == nil {
		return nil
	}

	return &Me{
		ID:            IDFrom(u.ID()),
		Name:          u.Name(),
		Email:         u.Email(),
		Lang:          u.Lang(),
		Host:          lo.EmptyableToPtr(u.Host()),
		Theme:         Theme(u.Theme()),
		MyWorkspaceID: IDFrom(u.Workspace()),
		Auths: util.Map(u.Auths(), func(a user.Auth) string {
			return a.Provider
		}),
	}
}

func ToTheme(t *Theme) *user.Theme {
	if t == nil {
		return nil
	}

	th := user.ThemeDefault
	switch *t {
	case ThemeDark:
		th = user.ThemeDark
	case ThemeLight:
		th = user.ThemeLight
	}
	return &th
}

func ToWorkspace(t *workspace.Workspace) *Workspace {
	if t == nil {
		return nil
	}

	usersMap := t.Members().Users()
	integrationsMap := t.Members().Integrations()
	members := make([]WorkspaceMember, 0, len(usersMap)+len(integrationsMap))
	for u, m := range usersMap {
		members = append(members, &WorkspaceUserMember{
			UserID: IDFrom(u),
			Role:   ToRole(m.Role),
			Host:   lo.EmptyableToPtr(m.Host),
		})
	}
	for i, m := range integrationsMap {
		members = append(members, &WorkspaceIntegrationMember{
			IntegrationID: IDFrom(i),
			Role:          ToRole(m.Role),
			Active:        !m.Disabled,
			InvitedByID:   IDFrom(m.InvitedBy),
			InvitedBy:     nil,
			Integration:   nil,
		})
	}

	return &Workspace{
		ID:       IDFrom(t.ID()),
		Name:     t.Name(),
		Personal: t.IsPersonal(),
		Members:  members,
	}
}

func FromRole(r Role) workspace.Role {
	switch r {
	case RoleReader:
		return workspace.RoleReader
	case RoleWriter:
		return workspace.RoleWriter
	case RoleMaintainer:
		return workspace.RoleMaintainer
	case RoleOwner:
		return workspace.RoleOwner
	}
	return workspace.Role("")
}

func ToRole(r workspace.Role) Role {
	switch r {
	case workspace.RoleReader:
		return RoleReader
	case workspace.RoleWriter:
		return RoleWriter
	case workspace.RoleMaintainer:
		return RoleMaintainer
	case workspace.RoleOwner:
		return RoleOwner
	}
	return Role("")
}
