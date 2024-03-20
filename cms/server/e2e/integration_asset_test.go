package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

// GET /assets/{assetId}
func TestIntegrationGetAssetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET("/api/assets/{assetId}", id.NewAssetID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/assets/{assetId}", id.NewAssetID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/assets/{assetId}", id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("projectId", pid).
		HasValue("name", "aaa.jpg").
		HasValue("contentType", "image/jpg").
		HasValue("totalSize", 1000)
}

// DELETE /assets/{assetId}
func TestIntegrationDeleteAssetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.DELETE("/api/assets/{assetId}", aid1).
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("projectId", pid).
		HasValue("name", "aaa.jpg").
		HasValue("contentType", "image/jpg").
		HasValue("totalSize", 1000)

	e.DELETE("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String())

	e.GET("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}
