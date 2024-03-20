package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func createProject(e *httpexpect.Expect, wID, name, desc, alias string) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateProject($workspaceId: ID!, $name: String!, $description: String!, $alias: String!) {
				  createProject(input: {workspaceId: $workspaceId, name: $name, description: $description, alias: $alias}) {
					project {
					  id
					  name
					  description
					  alias
					  publication {
						scope
						assetPublic
						__typename
					  }
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"workspaceId": wID,
			"name":        name,
			"description": desc,
			"alias":       alias,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res.Path("$.data.createProject.project.id").Raw().(string), res
}

func TestCreateProject(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	_, res := createProject(e, wId.String(), "test", "test", "test-1")

	res.Object().
		Value("data").Object().
		Value("createProject").Object().
		Value("project").Object().
		HasValue("name", "test")
}
