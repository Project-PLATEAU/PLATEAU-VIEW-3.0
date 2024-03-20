package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func createGroup(e *httpexpect.Expect, pID, name, desc, key string) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateGroup($projectId: ID!, $name: String!, $description: String, $key: String!) {
				  createGroup(input: {projectId: $projectId, name: $name, description: $description, key: $key}) {
					group {
					  id
					  name
					  description
					  key
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"projectId":   pID,
			"name":        name,
			"description": desc,
			"key":         key,
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

	return res.Path("$.data.createGroup.group.id").Raw().(string), res
}

func TestCreateGroup(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	_, res := createGroup(e, pId, "test", "test", "test-1")

	res.Object().
		Value("data").Object().
		Value("createGroup").Object().
		Value("group").Object().
		HasValue("name", "test").
		HasValue("description", "test").
		HasValue("key", "test-1")

}
