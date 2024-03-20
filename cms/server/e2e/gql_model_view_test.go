package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

func createView(e *httpexpect.Expect, pID, mID, name string, sort, filter map[string]any, columns []map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateView($projectId: ID!, $modelId: ID!, $name: String!, $sort: ItemSortInput, $filter: ConditionInput, $columns: [ColumnSelectionInput!]) {
				  createView(input: {projectId: $projectId, modelId: $modelId, name: $name, sort: $sort, filter: $filter, columns: $columns}) {
					view {
					  id
					  name
					  sort {
						field {
						  type
						  id	
						}
						direction
		              }
					  columns {
						field {
							type
							id
						}
						visible
					  }
					  filter {
						
						  ... on BoolFieldCondition {
							fieldId {
							  type
							  id
							}
							operator
							value
						  }
						
					  }
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"projectId": pID,
			"modelId":   mID,
			"name":      name,
			"sort":      sort,
			"filter":    filter,
			"columns":   columns,
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

	return res.Path("$.data.createView.view.id").Raw().(string), res
}

func updateView(e *httpexpect.Expect, vID, name string, sort, filter map[string]any, columns []map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateView($viewId: ID!, $name: String!, $sort: ItemSortInput, $filter: ConditionInput, $columns: [ColumnSelectionInput!]) {
				  updateView(input: {viewId: $viewId, name: $name, sort: $sort, filter: $filter, columns: $columns}) {
					view {
					  id
					  name
					  sort {
						field {
						  type
						  id	
						}
						direction
		              }
					  columns {
						field {
							type
							id
						}
						visible
					  }
					  filter {
						
						  ... on BoolFieldCondition {
							fieldId {
							  type
							  id
							}
							operator
							value
						  }
						
					  }
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"viewId":  vID,
			"name":    name,
			"sort":    sort,
			"filter":  filter,
			"columns": columns,
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

	return res.Path("$.data.updateView.view.id").Raw().(string), res
}

func deleteView(e *httpexpect.Expect, vID string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation DeleteView($viewId: ID!) {
				  deleteView(input: {viewId: $viewId}) {
					viewId
				  }
				}`,
		Variables: map[string]any{
			"viewId": vID,
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

func getViews(e *httpexpect.Expect, mID string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `query GetView($modelId: ID!) {
				  view(modelId: $modelId) {
					  id
					  name
					  sort {
						field {
						  type
						  id	
						}
						direction
		              }
					  columns {
						field{
							type
							id
						}
						visible
					  }
					  filter {
						  ... on BoolFieldCondition {
							fieldId {
							  type
							  id
							}
							operator
							value
						  }
						
					  }
					  __typename
					}
					__typename
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

	return res
}

func TestViewCRUD(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	mID, _ := createModel(e, pId, "test", "test", "test-1")

	sort := map[string]any{
		"field": map[string]any{
			"type": "ID",
			"id":   nil,
		},
		"direction": "ASC",
	}
	columns := []map[string]any{
		{"field": map[string]any{"type": "ID", "id": nil}, "visible": true},
		{"field": map[string]any{"type": "CREATION_DATE", "id": nil}, "visible": false},
	}
	filter := map[string]any{
		"bool": map[string]any{
			"fieldId": map[string]any{
				"type": "META_FIELD",
				"id":   id.NewFieldID().String(),
			},
			"operator": "EQUALS",
			"value":    true,
		},
	}
	vID, res := createView(e, pId, mID, "test", sort, filter, columns)

	res.Object().
		Value("data").Object().
		Value("createView").Object().
		Value("view").Object().
		HasValue("name", "test").
		HasValue("sort", sort).
		HasValue("columns", columns).
		HasValue("filter", filter["bool"])

	res = getViews(e, mID)
	res.Object().
		Value("data").Object().
		Value("view").Array().
		Value(0).Object().
		HasValue("name", "test").
		HasValue("sort", sort).
		HasValue("columns", columns).
		HasValue("filter", filter["bool"])

	res = deleteView(e, vID)
	res.Path("$.errors[0].message").String().IsEqual("model should have at least one view")

	// Test update
	sort = map[string]any{
		"field": map[string]any{
			"type": "FIELD",
			"id":   id.NewFieldID().String(),
		},
		"direction": "DESC",
	}
	updateView(e, vID, "test updated", sort, filter, columns)

	res = getViews(e, mID)
	res.Object().
		Value("data").Object().
		Value("view").Array().
		Value(0).Object().
		HasValue("name", "test updated").
		HasValue("sort", sort).
		HasValue("columns", columns).
		HasValue("filter", filter["bool"])

	// test reset
	updateView(e, vID, "test updated", nil, nil, nil)

	res = getViews(e, mID)
	res.Object().
		Value("data").Object().
		Value("view").Array().
		Value(0).Object().
		HasValue("name", "test updated").
		HasValue("sort", nil).
		HasValue("columns", []any{}).
		HasValue("filter", nil)
}
