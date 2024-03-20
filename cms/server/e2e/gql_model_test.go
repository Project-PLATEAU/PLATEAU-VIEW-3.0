package e2e

import (
	"github.com/samber/lo"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func createModel(e *httpexpect.Expect, pID, name, desc, key string) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateModel($projectId: ID!, $name: String, $description: String, $key: String) {
				  createModel(input: {projectId: $projectId, name: $name, description: $description, key: $key}) {
					model {
					  id
					  name
					  description
					  key
					  order
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

	return res.Path("$.data.createModel.model.id").Raw().(string), res
}

func updateModel(e *httpexpect.Expect, mId string, name, desc, key *string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateModel($modelId: ID!, $name: String, $description: String, $key: String,  $public: Boolean!) {
				  updateModel(input: {modelId: $modelId, name: $name, description: $description, key: $key, public: $public}) {
					model {
					  id
					  name
					  description
					  key
					  order
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelId":     mId,
			"name":        name,
			"description": desc,
			"key":         key,
			"public":      false,
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

	return res
}

func updateModelsOrder(e *httpexpect.Expect, ids []string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateModelsOrder($modelIds:[ID!]!) {
				  updateModelsOrder(input: {modelIds: $modelIds}) {
					models {
					  id
					  name
					  description
					  key
					  order
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelIds": ids,
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

	return res
}
func deleteModel(e *httpexpect.Expect, iID string) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation DeleteModel($modelId: ID!) {
				  deleteModel(input: {modelId: $modelId}) {
					modelId
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelId": iID,
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

	return res.Path("$.data.deleteModel.modelId").Raw().(string), res
}
func getModel(e *httpexpect.Expect, mID string) (string, string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `query GetModel($modelId: ID!) {
				  node(id: $modelId, type: Model) {
					id
					... on Model {
					  id
					  name
					  description
					  key
					  public
					  order
					  schema {
						id
						fields {
						  id
						  type
						  title
						  key
						  description
						  required
						  unique
						  isTitle
						  multiple
						  order
						  typeProperty {
							... on SchemaFieldText {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldTextArea {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldMarkdown {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldAsset {
							  assetDefaultValue: defaultValue
							  __typename
							}
							... on SchemaFieldSelect {
							  defaultValue: defaultValue
							  values
							  __typename
							}
							... on SchemaFieldTag {
							  tagDefaultValue: defaultValue
							  tags{
							    id
							    name
							    color
		  					  }
							  __typename
							}
							... on SchemaFieldInteger {
							  defaultValue: defaultValue
							  min
							  max
							  __typename
							}
							... on SchemaFieldBool {
							  defaultValue
							  __typename
							}
							... on SchemaFieldDate {
							  defaultValue
							  __typename
							}
							... on SchemaFieldURL {
							  defaultValue
							  __typename
							}
							__typename
						  }
						  __typename
						}
						__typename
					  }
					  metadataSchema {
	 					id
						fields {
						  id
						  type
						  title
						  key
						  description
						  required
						  unique
						  isTitle
						  multiple
						  order
						  typeProperty {
							... on SchemaFieldText {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldTextArea {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldMarkdown {
							  defaultValue
							  maxLength
							  __typename
							}
							... on SchemaFieldAsset {
							  assetDefaultValue: defaultValue
							  __typename
							}
							... on SchemaFieldSelect {
							  defaultValue: defaultValue
							  values
							  __typename
							}
							... on SchemaFieldTag {
							  tagDefaultValue: defaultValue
							  tags{
							    id
							    name
							    color
		  					  }
							  __typename
							}
							... on SchemaFieldInteger {
							  defaultValue: defaultValue
							  min
							  max
							  __typename
							}
							... on SchemaFieldBool {
							  defaultValue
							  __typename
							}
							... on SchemaFieldURL {
							  defaultValue
							  __typename
							}
							__typename
						  }
						  __typename
						}
						__typename
					  }
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelId": mID,
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

	var msId string
	if res.Path("$.data.node.metadataSchema").Raw() != nil {
		msId = res.Path("$.data.node.metadataSchema.id").Raw().(string)
	}

	return res.Path("$.data.node.schema.id").Raw().(string),
		msId,
		res
}

func TestCreateModel(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	_, res := createModel(e, pId, "test", "test", "test-1")

	res.Object().
		Value("data").Object().
		Value("createModel").Object().
		Value("model").Object().
		HasValue("name", "test").
		HasValue("description", "test").
		HasValue("key", "test-1")

}
func TestUpdateModel(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-2")

	mId, _ := createModel(e, pId, "test", "test", "test-2")
	res := updateModel(e, mId, lo.ToPtr("updated name"), lo.ToPtr("updated desc"), lo.ToPtr("updated_key"))
	res.Object().
		Value("data").Object().
		Value("updateModel").Object().
		Value("model").Object().
		HasValue("name", "updated name").
		HasValue("description", "updated desc").
		HasValue("key", "updated_key")
}

func TestUpdateModelsOrder(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-2")

	mId1, _ := createModel(e, pId, "test1", "test", "test-1")
	mId2, _ := createModel(e, pId, "test2", "test", "test-2")
	mId3, _ := createModel(e, pId, "test3", "test", "test-3")
	mId4, res := createModel(e, pId, "test4", "test", "test-4")
	res.Object().
		Value("data").Object().
		Value("createModel").Object().
		Value("model").Object().
		HasValue("name", "test4").
		HasValue("key", "test-4").
		HasValue("order", 3)
	res2 := updateModelsOrder(e, []string{mId4, mId1, mId2, mId3})
	res2.Path("$.data.updateModelsOrder.models[:].id").Array().IsEqual([]string{mId4, mId1, mId2, mId3})
	res2.Path("$.data.updateModelsOrder.models[:].order").Array().IsEqual([]int{0, 1, 2, 3})
	deleteModel(e, mId2)
	_, _, res3 := getModel(e, mId3)

	res3.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId3).
		HasValue("order", 2)
}
