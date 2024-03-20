package mongodoc

import (
	"net/url"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewProject(t *testing.T) {
	now := time.Now()
	pp := project.NewPublication(project.PublicationScopePublic, true)
	pId, wId := project.NewID(), project.NewWorkspaceID()
	r := []workspace.Role{workspace.RoleOwner, workspace.RoleMaintainer}
	tests := []struct {
		name   string
		args   *project.Project
		want   *ProjectDocument
		pDocId string
	}{
		{
			name: "new project",
			args: project.New().
				ID(pId).
				Name("abc").
				Description("xyz").
				Alias("ppp123").
				ImageURL(lo.Must1(url.Parse("https://huho.com/xzy"))).
				UpdatedAt(now).
				Workspace(wId).
				Publication(pp).
				RequestRoles(r).
				MustBuild(),
			want: &ProjectDocument{
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
				RequestRoles: fromRequestRoles(r),
			},
			pDocId: pId.String(),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, docId := NewProject(tt.args)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.pDocId, docId)
		})
	}
}

func TestNewProjectConsumer(t *testing.T) {
	c := NewProjectConsumer()
	assert.NotNil(t, c)
}

func TestNewProjectPublication(t *testing.T) {
	tests := []struct {
		name string
		args *project.Publication
		want *ProjectPublicationDocument
	}{
		{
			name: "new project publication",
			args: project.NewPublication(project.PublicationScopePublic, true),
			want: &ProjectPublicationDocument{
				AssetPublic: true,
				Scope:       "public",
			},
		},
		{
			name: "nil",
			args: nil,
			want: nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, NewProjectPublication(tt.args))
		})
	}
}

func TestProjectDocument_Model(t *testing.T) {
	now := time.Now()
	pId, wId := project.NewID(), project.NewWorkspaceID()
	pp := project.NewPublication(project.PublicationScopePublic, true)
	r := []workspace.Role{workspace.RoleOwner, workspace.RoleMaintainer}

	tests := []struct {
		name    string
		pDoc    *ProjectDocument
		want    *project.Project
		wantErr bool
	}{
		{
			name: "test model",
			pDoc: &ProjectDocument{
				ID:          pId.String(),
				UpdatedAt:   now,
				Name:        "abc",
				Description: "xyz",
				Alias:       "ppp123",
				ImageURL:    "https://hugo.com",
				Workspace:   wId.String(),
				Publication: &ProjectPublicationDocument{
					AssetPublic: true,
					Scope:       "public",
				},
				RequestRoles: fromRequestRoles(r),
			},
			want: project.New().
				ID(pId).
				Name("abc").
				Description("xyz").
				Alias("ppp123").
				ImageURL(lo.Must(url.Parse("https://hugo.com"))).
				UpdatedAt(now).
				Workspace(wId).
				Publication(pp).
				RequestRoles(r).
				MustBuild(),
			wantErr: false,
		},
		{
			name: "invalid image url",
			pDoc: &ProjectDocument{
				ID:          pId.String(),
				UpdatedAt:   now,
				Name:        "abc",
				Description: "xyz",
				Alias:       "ppp123",
				ImageURL:    "abc",
				Workspace:   wId.String(),
				Publication: &ProjectPublicationDocument{
					AssetPublic: true,
					Scope:       "public",
				},
			},
			want: project.New().
				ID(pId).
				Name("abc").
				Description("xyz").
				Alias("ppp123").
				ImageURL(nil).
				UpdatedAt(now).
				Workspace(wId).
				Publication(pp).
				MustBuild(),
			wantErr: false,
		},
		{
			name: "invalid id 1",
			pDoc: &ProjectDocument{
				ID:          "abc",
				UpdatedAt:   now,
				Name:        "abc",
				Description: "xyz",
				Alias:       "ppp123",
				ImageURL:    "abc",
				Workspace:   wId.String(),
				Publication: &ProjectPublicationDocument{
					AssetPublic: true,
					Scope:       "public",
				},
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "invalid id 2",
			pDoc: &ProjectDocument{
				ID:          pId.String(),
				UpdatedAt:   now,
				Name:        "abc",
				Description: "xyz",
				Alias:       "ppp123",
				ImageURL:    "abc",
				Workspace:   "abc",
				Publication: &ProjectPublicationDocument{
					AssetPublic: true,
					Scope:       "public",
				},
			},
			want:    nil,
			wantErr: true,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			got, err := tt.pDoc.Model()
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestProjectPublicationDocument_Model(t *testing.T) {
	tests := []struct {
		name  string
		ppDoc *ProjectPublicationDocument
		want  *project.Publication
	}{
		{
			name: "test model",
			ppDoc: &ProjectPublicationDocument{
				AssetPublic: true,
				Scope:       "public",
			},
			want: project.NewPublication(project.PublicationScopePublic, true),
		},
		{
			name:  "nil",
			ppDoc: nil,
			want:  nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.ppDoc.Model())
		})
	}
}
