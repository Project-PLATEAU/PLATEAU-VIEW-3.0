package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

// GET /projects/{projectIdOrAlias}/models/{modelIdOrKey}/items
func TestIntegrationItemListWithProjectAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	obj := e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	obj.Value("page").IsEqual(1)
	obj.Value("perPage").IsEqual(5)
	obj.Value("totalCount").IsEqual(1)

	a := obj.Value("items").Array()
	a.Length().IsEqual(1)
	assertItem(a.Value(0), false)

	// model key can be also usable
	obj = e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, ikey1).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 1)

	a = obj.Value("items").Array()
	a.Length().IsEqual(1)
	assertItem(a.Value(0), false)

	// project alias can be also usable
	obj = e.GET("/api/projects/{projectId}/models/{modelId}/items", palias, ikey1).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 1)

	a = obj.Value("items").Array()
	a.Length().IsEqual(1)
	assertItem(a.Value(0), false)

	// asset embeded
	obj = e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		WithQuery("asset", "true").
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 1)

	a = obj.Value("items").Array()
	a.Length().IsEqual(1)
	assertItem(a.Value(0), true)

	// invalid key
	e.GET("/api/projects/{projectId}/models/{modelId}/items", pid, "xxx").
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	// invalid project
	e.GET("/api/projects/{projectId}/models/{modelId}/items", id.NewProjectID(), ikey1).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)
}

// POST /projects/{projectIdOrAlias}/models/{modelIdOrKey}/items
func TestIntegrationCreateItemWithProjectAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.POST("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items", palias, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items", palias, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items", palias, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	r := e.POST("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items", palias, ikey1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"id":    fId1.String(),
					"value": "test value",
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	r.Keys().
		ContainsAll("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	r.Value("fields").IsEqual([]any{
		map[string]string{
			"id":    fId1.String(),
			"type":  "text",
			"value": "test value",
			"key":   sfKey1.String(),
		},
	})
	r.Value("modelId").IsEqual(mId1.String())
	r.Value("refs").IsEqual([]string{"latest"})

	e.POST("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/items", palias, ikey1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"fields": []interface{}{
				map[string]string{
					"key":   sfKey1.String(),
					"value": "test value 2",
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("fields").
		IsEqual([]any{
			map[string]string{
				"id":    fId1.String(),
				"type":  "text",
				"value": "test value 2",
				"key":   sfKey1.String(),
			},
		})
}
