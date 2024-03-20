package e2e

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	adapterhttp "github.com/reearth/reearth-cms/server/internal/adapter/http"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/idx"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func baseSeederHTTPUser(ctx context.Context, r *repo.Container) error {
	u := user.New().ID(uId1).
		Name("e2e").
		Email("e2e@e2e.com").
		Auths([]user.Auth{
			{
				Provider: "provider",
				Sub:      "sub",
			},
		}).
		Theme(user.ThemeDark).
		Lang(language.Japanese).
		Workspace(wId).
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}
	u2 := user.New().ID(uId2).
		Name("e2e2").
		Email("e2e2@e2e.com").
		MustBuild()
	if err := r.User.Save(ctx, u2); err != nil {
		return err
	}
	u3 := user.New().ID(uId3).
		Name("e2e2").
		Email("e2e3@e2e.com").
		MustBuild()
	if err := r.User.Save(ctx, u3); err != nil {
		return err
	}
	roleOwner := workspace.Member{
		Role: workspace.RoleOwner,
	}

	w := workspace.New().ID(wId).
		Name("e2e").
		Members(map[idx.ID[accountdomain.User]]workspace.Member{
			uId1: roleOwner,
		}).
		Integrations(map[idx.ID[accountdomain.Integration]]workspace.Member{
			iId1: roleOwner,
		}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	return nil
}

func TestSignUp(t *testing.T) {
	e, r := StartGQLServer(t, &app.Config{}, true, baseSeederHTTPUser)
	input := &adapterhttp.SignupInput{
		Name:        "name",
		Email:       "test@example.com",
		Password:    "Jwhdpk7diw",
		WorkspaceID: &wId,
	}
	jsonData, err := json.Marshal(input)
	if err != nil {
		assert.NoError(t, err)
	}
	o := e.POST("/api/signup").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object()
	o.Value("name").String().IsEqual("name")
	o.Value("email").String().IsEqual("test@example.com")
	o.Value("id").String().NotEmpty()

	u, err := r.User.FindByEmail(context.Background(), "test@example.com")
	assert.NoError(t, err)
	assert.Equal(t, "name", u.Name())
	assert.Equal(t, wId, u.Workspace())
}
