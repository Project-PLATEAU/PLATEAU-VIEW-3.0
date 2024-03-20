package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
)

// Get|/items/{itemId}/comments
func TestIntegrationItemCommentListAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET("/api/items/{itemId}/comments", id.NewItemID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/items/{itemId}/comments", id.NewItemID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/items/{itemId}/comments", id.NewItemID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/items/{itemId}/comments", id.NewItemID()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	r := e.GET("/api/items/{itemId}/comments", itmId1).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	r.Keys().ContainsAll("comments")
	c := r.Value("comments").Array().Value(0).Object()
	c.Value("id").IsEqual(icId.String())
	c.Value("authorId").IsEqual(uId.String())
	c.Value("authorType").IsEqual(integrationapi.User)
	c.Value("content").IsEqual("test comment")
}

// Post|/items/{itemId}/comments
func TestIntegrationCreateItemCommentAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.POST("/api/items/{itemId}/comments", id.NewItemID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/items/{itemId}/comments", id.NewItemID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/items/{itemId}/comments", id.NewItemID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/items/{itemId}/comments", id.NewItemID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	c := e.POST("/api/items/{itemId}/comments", itmId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"content": "test",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	// c.Value("id").Equal(icId.String())
	c.Value("authorId").IsEqual(iId)
	c.Value("authorType").IsEqual(integrationapi.Integrtaion)
	c.Value("content").IsEqual("test")
}

// Patch|/items/{itemId}/comments/{commentId}
func TestIntegrationUpdateItemCommentAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.PATCH("/api/items/{itemId}/comments/{commentId}", id.NewItemID(), id.NewCommentID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH("/api/items/{itemId}/comments/{commentId}", id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH("/api/items/{itemId}/comments/{commentId}", id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH("/api/items/{itemId}/comments/{commentId}", id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	r := e.PATCH("/api/items/{itemId}/comments/{commentId}", itmId1, icId).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"content": "updated content",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	r.Keys().
		ContainsAll("id", "authorId", "authorType", "content", "createdAt")
	r.Value("id").IsEqual(icId.String())
	r.Value("authorId").IsEqual(uId)
	r.Value("authorType").IsEqual(integrationapi.User)
	r.Value("content").IsEqual("updated content")
}

// Delete|/items/{itemId}/comments/{commentId}
func TestIntegrationDeleteItemCommentAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.DELETE("/api/items/{itemId}/comments/{commentId}", id.NewItemID(), id.NewCommentID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE("/api/items/{itemId}/comments/{commentId}", itmId1, icId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		ContainsAll("id")

	e.GET("/api/items/{itemId}/comments", itmId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().Object().Value("comments").Array().IsEmpty()
}
