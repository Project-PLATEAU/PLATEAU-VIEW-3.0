package e2e

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

var (
	uId1 = accountdomain.NewUserID()
	uId2 = accountdomain.NewUserID()
	uId3 = accountdomain.NewUserID()
	wId  = accountdomain.NewWorkspaceID()
	wId2 = accountdomain.NewWorkspaceID()
	iId1 = accountdomain.NewIntegrationID()
	iId2 = accountdomain.NewIntegrationID()
	iId3 = accountdomain.NewIntegrationID()
	rid  = workspacesettings.NewResourceID()
	rid2 = workspacesettings.NewResourceID()
)

func baseSeederWorkspace(ctx context.Context, r *repo.Container) error {
	u := user.New().ID(uId1).
		Name("e2e").
		Email("e2e@e2e.com").
		Workspace(wId).
		Lang(language.English).
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}
	u2 := user.New().ID(uId2).
		Name("e2e2").
		Email("e2e2@e2e.com").
		Workspace(wId2).
		MustBuild()
	if err := r.User.Save(ctx, u2); err != nil {
		return err
	}
	u3 := user.New().ID(uId3).
		Name("e2e3").
		Email("e2e3@e2e.com").
		Workspace(wId2).
		MustBuild()
	if err := r.User.Save(ctx, u3); err != nil {
		return err
	}
	roleOwner := workspace.Member{
		Role:      workspace.RoleOwner,
		InvitedBy: uId2,
	}
	roleReader := workspace.Member{
		Role:      workspace.RoleReader,
		InvitedBy: uId1,
	}

	w := workspace.New().ID(wId).
		Name("e2e").
		Members(map[idx.ID[accountdomain.User]]workspace.Member{
			uId1: roleOwner,
		}).
		Integrations(map[idx.ID[accountdomain.Integration]]workspace.Member{
			iId1: roleOwner,
			iId3: roleReader,
		}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	w2 := workspace.New().ID(wId2).
		Name("e2e2").
		Members(map[idx.ID[accountdomain.User]]workspace.Member{
			uId1: roleOwner,
			uId3: roleReader,
		}).
		Integrations(map[idx.ID[accountdomain.Integration]]workspace.Member{
			iId1: roleOwner,
		}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w2); err != nil {
		return err
	}

	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt := workspacesettings.NewTileResource(rid, workspacesettings.TileTypeDefault, pp)
	r1 := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt, nil)
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{r1}, rid.Ref(), lo.ToPtr(false))

	rid2 := workspacesettings.NewResourceID()
	pp2 := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt2 := workspacesettings.NewTerrainResource(rid, workspacesettings.TerrainType(workspacesettings.TerrainTypeCesiumIon), pp2)
	r2 := workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, tt2)
	terrains := workspacesettings.NewResourceList([]*workspacesettings.Resource{r2}, rid2.Ref(), lo.ToPtr(true))

	ws := workspacesettings.New().ID(wId).Tiles(tiles).Terrains(terrains).MustBuild()
	if err := r.WorkspaceSettings.Save(ctx, ws); err != nil {
		return err
	}

	return nil
}

func TestCreateWorkspace(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)

	query := `mutation { createWorkspace(input: {name: "test"}){ workspace{ id name } }}`
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).
		Expect().
		Status(http.StatusOK).
		JSON().Object().
		Value("data").Object().
		Value("createWorkspace").Object().
		Value("workspace").Object().
		Value("name").String().IsEqual("test")
}

func TestDeleteWorkspace(t *testing.T) {
	e, r := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)
	_, err := r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	query := fmt.Sprintf(`mutation { deleteWorkspace(input: {workspaceId: "%s"}){ workspaceId }}`, wId)
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	assert.Nil(t, err)

	o := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object()
	o.Value("data").Object().Value("deleteWorkspace").Object().Value("workspaceId").String().IsEqual(wId.String())

	_, err = r.Workspace.FindByID(context.Background(), wId)
	assert.Equal(t, rerror.ErrNotFound, err)

	query = fmt.Sprintf(`mutation { deleteWorkspace(input: {workspaceId: "%s"}){ workspaceId }}`, accountdomain.NewWorkspaceID())
	request = GraphQLRequest{
		Query: query,
	}
	jsonData, err = json.Marshal(request)
	assert.Nil(t, err)

	o = e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object()

	o.Value("errors").Array().Value(0).Object().Value("message").IsEqual("operation denied")
}

func TestUpdateWorkspace(t *testing.T) {
	e, r := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)

	w, err := r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	assert.Equal(t, "e2e", w.Name())

	query := fmt.Sprintf(`mutation { updateWorkspace(input: {workspaceId: "%s",name: "%s"}){ workspace{ id name } }}`, wId, "updated")
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.Nil(t, err)
	}
	o := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object()
	o.Value("data").Object().Value("updateWorkspace").Object().Value("workspace").Object().Value("name").String().IsEqual("updated")

	w, err = r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	assert.Equal(t, "updated", w.Name())

	query = fmt.Sprintf(`mutation { updateWorkspace(input: {workspaceId: "%s",name: "%s"}){ workspace{ id name } }}`, accountdomain.NewWorkspaceID(), "updated")
	request = GraphQLRequest{
		Query: query,
	}
	jsonData, err = json.Marshal(request)
	if err != nil {
		assert.Nil(t, err)
	}
	o = e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object()
	o.Value("errors").Array().Value(0).Object().Value("message").IsEqual("not found")
}

func TestAddUsersToWorkspace(t *testing.T) {
	e, r := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)

	w, err := r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	assert.False(t, w.Members().HasUser(uId2))

	query := fmt.Sprintf(`mutation { addUsersToWorkspace(input: {workspaceId: "%s", users: [{userId: "%s", role: READER}]}){ workspace{ id } }}`, wId, uId2)
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.Nil(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK)

	w, err = r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasUser(uId2))
	assert.Equal(t, w.Members().User(uId2).Role, workspace.RoleReader)

	query = fmt.Sprintf(`mutation { addUsersToWorkspace(input: {workspaceId: "%s", users: [{userId: "%s", role: READER}]}){ workspace{ id } }}`, wId, uId2)
	request = GraphQLRequest{
		Query: query,
	}
	jsonData, err = json.Marshal(request)
	if err != nil {
		assert.Nil(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().
		Value("errors").Array().Value(0).Object().Value("message").IsEqual("user already joined")
}

func TestRemoveUserFromWorkspace(t *testing.T) {
	e, r := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)

	w, err := r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasUser(uId3))

	query := fmt.Sprintf(`mutation { removeUserFromWorkspace(input: {workspaceId: "%s", userId: "%s"}){ workspace{ id } }}`, wId2, uId3)
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.Nil(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK)

	w, err = r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	assert.False(t, w.Members().HasUser(uId3))

	o := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object()
	o.Value("errors").Array().Value(0).Object().Value("message").IsEqual("target user does not exist in the workspace")
}

func TestUpdateMemberOfWorkspace(t *testing.T) {
	e, r := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)

	w, err := r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().User(uId3).Role, workspace.RoleReader)
	query := fmt.Sprintf(`mutation { updateUserOfWorkspace(input: {workspaceId: "%s", userId: "%s", role: MAINTAINER}){ workspace{ id } }}`, wId2, uId3)
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.Nil(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK)

	w, err = r.Workspace.FindByID(context.Background(), wId2)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().User(uId3).Role, workspace.RoleMaintainer)

	query = fmt.Sprintf(`mutation { updateUserOfWorkspace(input: {workspaceId: "%s", userId: "%s", role: MAINTAINER}){ workspace{ id } }}`, accountdomain.NewWorkspaceID(), uId3)
	request = GraphQLRequest{
		Query: query,
	}
	jsonData, err = json.Marshal(request)
	if err != nil {
		assert.Nil(t, err)
	}
	o := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object()
	o.Value("errors").Array().Value(0).Object().Value("message").IsEqual("operation denied")
}

func TestAddIntegrationToWorkspace(t *testing.T) {
	e, r := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)

	w, err := r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	assert.False(t, w.Members().HasUser(uId2))

	query := fmt.Sprintf(`mutation { addIntegrationToWorkspace(input: {workspaceId: "%s", integrationId: "%s",  role: READER}){ workspace{ id } }}`, wId, iId2)
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.Nil(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK)

	w, err = r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasIntegration(iId2))
	assert.Equal(t, w.Members().Integration(iId2).Role, workspace.RoleReader)

	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().
		Value("errors").Array().Value(0).Object().Value("message").IsEqual("user already joined")
}

func TestRemoveIntegrationFromWorkspace(t *testing.T) {
	e, r := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)

	w, err := r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	assert.True(t, w.Members().HasIntegration(iId1))

	query := fmt.Sprintf(`mutation { removeIntegrationFromWorkspace(input: {workspaceId: "%s", integrationId: "%s"}){ workspace{ id } }}`, wId, iId1)
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.Nil(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK)

	w, err = r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	assert.False(t, w.Members().HasIntegration(iId1))

	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().
		Value("errors").Array().Value(0).Object().Value("message").IsEqual("target user does not exist in the workspace")
}

func TestUpdateIntegrationOfWorkspace(t *testing.T) {
	e, r := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)

	w, err := r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().Integration(iId3).Role, workspace.RoleReader)
	query := fmt.Sprintf(`mutation { updateIntegrationOfWorkspace(input: {workspaceId: "%s", integrationId: "%s", role: MAINTAINER}){ workspace{ id } }}`, wId, iId3)
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.Nil(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK)

	w, err = r.Workspace.FindByID(context.Background(), wId)
	assert.Nil(t, err)
	assert.Equal(t, w.Members().Integration(iId3).Role, workspace.RoleMaintainer)

	query = fmt.Sprintf(`mutation { updateIntegrationOfWorkspace(input: {workspaceId: "%s", integrationId: "%s", role: MAINTAINER}){ workspace{ id } }}`, wId, iId2)
	request = GraphQLRequest{
		Query: query,
	}
	jsonData, err = json.Marshal(request)
	if err != nil {
		assert.Nil(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().
		Value("errors").Array().Value(0).Object().Value("message").IsEqual("target user does not exist in the workspace")
}
