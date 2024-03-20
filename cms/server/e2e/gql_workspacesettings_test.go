package e2e

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func updateWorkspaceSettings(e *httpexpect.Expect, wID string, tiles map[string]any, terrains map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateWorkspaceSettings($id: ID!, $tiles: ResourcesListInput!, $terrains: ResourcesListInput!) {
			updateWorkspaceSettings(input: {id: $id,tiles: $tiles,terrains: $terrains}) {
			  workspaceSettings{
				id
				tiles {
					resources {
						... on TileResource {
						  id
						  type
						  props {
							  name
							  url
							  image
						  }
						}
					}
					enabled
					selectedResource
				},
				terrains {
					resources {
						... on TerrainResource {
						  id
						  type
						  props {
							  name
							  url
							  image
							  cesiumIonAssetId
							  cesiumIonAccessToken
						  }
						}
					}
					enabled
					selectedResource
				},		  
			  }
			} 
		  }`,
		Variables: map[string]any{
			"id":       wID,
			"tiles":    tiles,
			"terrains": terrains,
		},
	}

	jsonData, _ := json.Marshal(requestBody)

	res := e.POST("/api/graphql").
	WithHeader("authorization", "Bearer test").
	WithHeader("Content-Type", "application/json").
	WithHeader("X-Reearth-Debug-User", uId1.String()).
	WithBytes(jsonData).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

func TestUpdateWorkspaceSettings(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)

	tiles:= map[string]any{
        "resources": []map[string]any{
            {
                "tile": map[string]any{
                    "id": rid.String(),
                    "type": "DEFAULT",
                    "props" : map[string]any{
                        "name": "name1",
                        "url": "url1",
                        "image": "image1",
                    },
                },
            },
		},
        "selectedResource": rid.String(),
        "enabled": false,
    }
	terrains:= map[string]any{
        "resources": []map[string]any{
            {
                "terrain": map[string]any{
                    "id": rid2.String(),
                    "type": "CESIUM_ION",
                    "props" : map[string]any{
                        "name": "name1",
                        "url": "url1",
                        "image": "image1",
						"cesiumIonAssetId": "test1",
                        "cesiumIonAccessToken": "test1",
                    },
                },
            },
		},
        "selectedResource": rid2.String(),
        "enabled": false,
    }

	res := updateWorkspaceSettings(e, wId.String(), tiles, terrains)
	o := res.Object().
		Value("data").Object().
		Value("updateWorkspaceSettings").Object().
		Value("workspaceSettings").Object()
		
	o.HasValue("id", wId.String())
	t1 := o.Value("tiles").Object()
	t1.Value("enabled").Boolean().IsFalse()
	t1.Value("selectedResource").String().IsEqual(rid.String())
	r1 := t1.Value("resources").Array().Value(0).Object()
	r1.Value("id").String().IsEqual(rid.String())
	r1.Value("type").String().IsEqual("DEFAULT")
	r1.Value("props").Object().Value("name").String().IsEqual("name1")
	r1.Value("props").Object().Value("url").String().IsEqual("url1")
	r1.Value("props").Object().Value("image").String().IsEqual("image1")

	t2 := o.Value("terrains").Object()
	t2.Value("enabled").Boolean().IsFalse()
	t2.Value("selectedResource").String().IsEqual(rid2.String())
	r2 := t2.Value("resources").Array().Value(0).Object()
	r2.Value("id").String().IsEqual(rid2.String())
	r2.Value("type").String().IsEqual("CESIUM_ION")
	r2.Value("props").Object().Value("name").String().IsEqual("name1")
	r2.Value("props").Object().Value("url").String().IsEqual("url1")
	r2.Value("props").Object().Value("image").String().IsEqual("image1")
	r2.Value("props").Object().Value("cesiumIonAssetId").String().IsEqual("test1")
	r2.Value("props").Object().Value("cesiumIonAccessToken").String().IsEqual("test1")
}
