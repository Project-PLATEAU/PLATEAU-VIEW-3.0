package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/stretchr/testify/assert"
)

func createField(e *httpexpect.Expect, mID, title, desc, key string, multiple, unique, isTitle, required bool, fType string, fTypeProp map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateField($modelId: ID!, $type: SchemaFieldType!, $title: String!, $description: String, $key: String!, $multiple: Boolean!, $unique: Boolean!, $isTitle: Boolean!, $required: Boolean!, $typeProperty: SchemaFieldTypePropertyInput!) {
				  createField(input: {modelId: $modelId, type: $type, title: $title, description: $description, key: $key, multiple: $multiple, unique: $unique, isTitle: $isTitle, required: $required, typeProperty: $typeProperty}) {
					field {
					  id
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelId":      mID,
			"title":        title,
			"description":  desc,
			"key":          key,
			"multiple":     multiple,
			"unique":       unique,
			"isTitle":      isTitle,
			"required":     required,
			"type":         fType,
			"typeProperty": fTypeProp,
		},
	}

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect()

	if res.Raw().StatusCode != http.StatusOK {
		res.JSON().IsNull()
	}

	json := res.JSON()
	return json.Path("$.data.createField.field.id").Raw().(string), json
}

func createMetaField(e *httpexpect.Expect, mID, title, desc, key string, multiple, unique, isTitle, required bool, fType string, fTypeProp map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation CreateField($modelId: ID!, $type: SchemaFieldType!, $metadata: Boolean, $title: String!, $description: String, $key: String!, $multiple: Boolean!, $unique: Boolean!, $isTitle: Boolean!, $required: Boolean!, $typeProperty: SchemaFieldTypePropertyInput!) {
				  createField(input: {modelId: $modelId, type: $type, metadata: $metadata, title: $title, description: $description, key: $key, multiple: $multiple, unique: $unique, isTitle: $isTitle, required: $required, typeProperty: $typeProperty}) {
					field {
					  id
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelId":      mID,
			"metadata":     true,
			"title":        title,
			"description":  desc,
			"key":          key,
			"multiple":     multiple,
			"unique":       unique,
			"isTitle":      isTitle,
			"required":     required,
			"type":         fType,
			"typeProperty": fTypeProp,
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

	return res.Path("$.data.createField.field.id").Raw().(string), res
}

func updateField(e *httpexpect.Expect, mID, fID, title, desc, key string, multiple, unique, isTitle, required bool, order *int, fType string, fTypeProp map[string]any) (string, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateField($modelId: ID!, $fieldId: ID!, $title: String!, $description: String, $order: Int, $key: String!, $multiple: Boolean!, $unique: Boolean!, $isTitle: Boolean!, $required: Boolean!, $typeProperty: SchemaFieldTypePropertyInput!) {
				  updateField(input: {modelId: $modelId, fieldId: $fieldId, title: $title, description: $description, order: $order, key: $key, multiple: $multiple, unique: $unique, isTitle: $isTitle, required: $required, typeProperty: $typeProperty}) {
					field {
					  id
					  __typename
					}
					__typename
				  }
				}`,
		Variables: map[string]any{
			"modelId":      mID,
			"fieldId":      fID,
			"title":        title,
			"description":  desc,
			"key":          key,
			"multiple":     multiple,
			"unique":       unique,
			"isTitle":      isTitle,
			"required":     required,
			"type":         fType,
			"order":        order,
			"typeProperty": fTypeProp,
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

	return res.Path("$.data.updateField.field.id").Raw().(string), res
}

type fIds struct {
	textFId     string
	textAreaFId string
	markdownFId string
	assetFId    string
	boolFId     string
	selectFId   string
	integerFId  string
	urlFId      string
	dateFId     string
	tagFID      string
	checkFid    string
}

func createFieldOfEachType(t *testing.T, e *httpexpect.Expect, mId string) fIds {
	textFId, _ := createField(e, mId, "text", "text", "text",
		false, false, false, false, "Text",
		map[string]any{
			"text": map[string]any{},
		})

	textAreaFId, _ := createField(e, mId, "textArea", "textArea", "textArea",
		false, false, false, false, "TextArea",
		map[string]any{
			"textArea": map[string]any{},
		})

	markdownFId, _ := createField(e, mId, "markdown", "markdown", "markdown",
		false, false, false, false, "MarkdownText",
		map[string]any{
			"markdownText": map[string]any{},
		})

	assetFId, _ := createField(e, mId, "asset", "asset", "asset",
		false, false, false, false, "Asset",
		map[string]any{
			"asset": map[string]any{},
		})

	boolFId, _ := createField(e, mId, "bool", "bool", "bool",
		false, false, false, false, "Bool",
		map[string]any{
			"bool": map[string]any{},
		})

	selectFId, _ := createField(e, mId, "select", "select", "select",
		false, false, false, false, "Select",
		map[string]any{
			"select": map[string]any{
				"defaultValue": nil,
				"values":       []any{"s1", "s2", "s3"},
			},
		})

	integerFId, _ := createField(e, mId, "integer", "integer", "integer",
		false, false, false, false, "Integer",
		map[string]any{
			"integer": map[string]any{
				"defaultValue": nil,
				"min":          nil,
				"max":          nil,
			},
		})

	urlFId, _ := createField(e, mId, "url", "url", "url",
		false, false, false, false, "URL",
		map[string]any{
			"url": map[string]any{},
		})

	dateFId, _ := createField(e, mId, "date", "date", "date",
		false, false, false, false, "Date",
		map[string]any{
			"date": map[string]any{
				"defaultValue": "2024-01-01T18:06:09+09:00",
			},
		})
	tagFId, _ := createField(e, mId, "tag", "tag", "m_tag",
		false, false, false, false, "Tag",
		map[string]any{
			"tag": map[string]any{
				"tags": []any{
					map[string]any{"name": "Tag1", "color": "RED"},
					map[string]any{"name": "Tag2", "color": "MAGENTA"},
					map[string]any{"name": "Tag3", "color": "GREEN"},
					map[string]any{"name": "Tag4", "color": "BLUE"},
					map[string]any{"name": "Tag5", "color": "GOLD"},
				},
			},
		})

	checkboxFId, _ := createField(e, mId, "checkbox", "checkbox", "m_checkbox",
		false, false, false, false, "Checkbox",
		map[string]any{
			"checkbox": map[string]any{},
		})

	_, _, res := getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)

	ids := res.Path("$.data.node.schema.fields[:].id").Raw().([]any)

	assert.Equal(t, []any{
		textFId,
		textAreaFId,
		markdownFId,
		assetFId,
		boolFId,
		selectFId,
		integerFId,
		urlFId,
		dateFId,
		tagFId,
		checkboxFId,
	}, ids)

	return fIds{
		textFId:     textFId,
		textAreaFId: textAreaFId,
		markdownFId: markdownFId,
		assetFId:    assetFId,
		boolFId:     boolFId,
		selectFId:   selectFId,
		integerFId:  integerFId,
		urlFId:      urlFId,
		dateFId:     dateFId,
		tagFID:      tagFId,
		checkFid:    checkboxFId,
	}
}

type mfIds struct {
	tagFId      string
	boolFId     string
	checkboxFId string
	dateFId     string
	textFId     string
	urlFId      string
}

func createMetaFieldOfEachType(t *testing.T, e *httpexpect.Expect, mId string) mfIds {
	tagFId, _ := createMetaField(e, mId, "tag", "tag", "m_tag",
		false, false, false, false, "Tag",
		map[string]any{
			"tag": map[string]any{
				"tags": []any{
					map[string]any{"name": "Tag1", "color": "RED"},
					map[string]any{"name": "Tag2", "color": "MAGENTA"},
					map[string]any{"name": "Tag3", "color": "GREEN"},
					map[string]any{"name": "Tag4", "color": "BLUE"},
					map[string]any{"name": "Tag5", "color": "GOLD"},
				},
			},
		})

	boolFId, _ := createMetaField(e, mId, "bool", "bool", "m_bool",
		false, false, false, false, "Bool",
		map[string]any{
			"bool": map[string]any{},
		})

	checkboxFId, _ := createMetaField(e, mId, "checkbox", "checkbox", "m_checkbox",
		false, false, false, false, "Checkbox",
		map[string]any{
			"checkbox": map[string]any{},
		})

	dateFId, _ := createMetaField(e, mId, "date", "date", "m_date",
		false, false, false, false, "Date",
		map[string]any{
			"date": map[string]any{},
		})

	textFId, _ := createMetaField(e, mId, "text", "text", "m_text",
		false, false, false, false, "Text",
		map[string]any{
			"text": map[string]any{},
		})

	urlFId, _ := createMetaField(e, mId, "url", "url", "m_url",
		false, false, false, false, "URL",
		map[string]any{
			"url": map[string]any{},
		})

	_, _, res := getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)

	ids := res.Path("$.data.node.metadataSchema.fields[:].id").Raw().([]any)

	assert.Equal(t, []any{
		tagFId,
		boolFId,
		checkboxFId,
		dateFId,
		textFId,
		urlFId,
	}, ids)

	return mfIds{
		tagFId:      tagFId,
		boolFId:     boolFId,
		checkboxFId: checkboxFId,
		dateFId:     dateFId,
		textFId:     textFId,
		urlFId:      urlFId,
	}
}

func TestCreateField(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	mId, _ := createModel(e, pId, "test", "test", "test-1")

	fId, _ := createField(e, mId, "test", "test", "test",
		true, true, true, true, "Tag",
		map[string]any{
			"tag": map[string]any{
				"defaultValue": []string{"s1", "s2"},
				"tags": []any{
					map[string]any{"id": nil, "name": "s1", "color": "RED"},
					map[string]any{"id": nil, "name": "s2", "color": "RED"},
					map[string]any{"id": nil, "name": "s3", "color": "RED"},
				},
			},
		})

	_, _, res := getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)

	tags := res.Path("$.data.node.schema.fields[0].typeProperty.tags").Raw().([]any)

	_, _ = updateField(e, mId, fId, "test", "test", "test",
		true, true, false, true, nil, "Tag",
		map[string]any{
			"tag": map[string]any{
				"defaultValue": []string{"s1", "s3"},
				"tags":         tags,
			},
		})

	_, _, res = getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)

	title := res.Path("$.data.node.schema.fields[0].isTitle").Raw().(bool)
	assert.False(t, title)
	_, _ = createField(e, mId, "test2", "test2", "test2",
		false, false, false, false, "Tag",
		map[string]any{
			"tag": map[string]any{
				"defaultValue": "t1",
				"tags": []any{
					map[string]any{"id": nil, "name": "t1", "color": "RED"},
					map[string]any{"id": nil, "name": "t2", "color": "RED"},
					map[string]any{"id": nil, "name": "t3", "color": "RED"},
				},
			},
		})

	_, _, res = getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)

}

func TestClearFieldDefaultValue(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	mId, _ := createModel(e, pId, "test", "test", "test-1")

	dateFId, _ := createField(e, mId, "date", "date", "m_date",
		false, false, false, false, "Date",
		map[string]any{
			"date": map[string]any{
				"defaultValue": "2024-01-01T18:06:09+09:00",
			},
		})
	intFid, _ := createField(e, mId, "integer", "integer", "integer",
		false, false, false, false, "Integer",
		map[string]any{
			"integer": map[string]any{
				"defaultValue": 9,
				"min":          nil,
				"max":          nil,
			},
		})
	selectFId, _ := createField(e, mId, "select", "select", "select",
		false, false, false, false, "Select",
		map[string]any{
			"select": map[string]any{
				"defaultValue": "s1",
				"values":       []any{"s1", "s2", "s3"},
			},
		})
	_, _, res := getModel(e, mId)

	dv := res.Path("$.data.node.schema.fields[:].typeProperty.defaultValue").Raw().([]any)

	assert.Equal(t, []any{"2024-01-01T18:06:09+09:00", float64(9), "s1"}, dv)

	_, _ = updateField(e, mId, dateFId, "date", "date", "m_date",
		false, false, false, false, nil, "Date",
		map[string]any{
			"date": map[string]any{
				"defaultValue": "",
			},
		})
	_, _ = updateField(e, mId, intFid, "integer", "integer", "integer",
		false, false, false, false, nil, "Integer",
		map[string]any{
			"integer": map[string]any{
				"defaultValue": "",
			},
		})

	_, _ = updateField(e, mId, selectFId, "select", "select", "select",
		false, false, false, false, nil, "Select",
		map[string]any{
			"select": map[string]any{
				"defaultValue": "",
				"values":       []any{"s1", "s2", "s3"},
			},
		})
	_, _, res = getModel(e, mId)

	res.Object().
		Value("data").Object().
		Value("node").Object().
		HasValue("id", mId)
	dv = res.Path("$.data.node.schema.fields[:].typeProperty.defaultValue").Raw().([]any)

	assert.Equal(t, []any{nil, nil, nil}, dv)
}
