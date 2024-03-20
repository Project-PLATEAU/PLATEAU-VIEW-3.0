package main

import (
	"context"
	"os"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestRefFieldSchema(t *testing.T) {
	s1ID, s2ID, s3ID := id.NewSchemaID().String(), id.NewSchemaID().String(), id.NewSchemaID().String()
	m1ID, m2ID, m3ID := id.NewModelID().String(), id.NewModelID().String(), id.NewModelID().String()
	s1 := map[string]any{
		"id": s1ID,
		"fields": []map[string]any{
			{
				"id": "1",
				"typeproperty": map[string]any{
					"type": "reference",
					"reference": map[string]any{
						"model":               m2ID,
						"correspondingschema": s2ID,
					},
				},
			},
			{
				"id": "2",
				"typeproperty": map[string]any{
					"type": "reference",
					"reference": map[string]any{
						"model":               m3ID,
						"correspondingschema": s3ID,
						"correspondingfield":  "3",
					},
				},
			},
		},
	}
	m1 := map[string]any{
		"id":     m1ID,
		"schema": s1ID,
	}
	s2 := map[string]any{
		"id":     s2ID,
		"fields": nil,
	}
	m2 := map[string]any{
		"id":     m2ID,
		"schema": s2ID,
	}
	s3 := map[string]any{
		"id": s3ID,
		"fields": []map[string]any{
			{
				"id": "3",
				"typeproperty": map[string]any{
					"type": "reference",
					"reference": map[string]any{
						"model":               m1ID,
						"correspondingschema": s1ID,
						"correspondingfield":  "2",
					},
				},
			},
		},
	}
	m3 := map[string]any{
		"id":     m3ID,
		"schema": s3ID,
	}

	db := mongotest.Connect(t)(t)
	log.Infof("test: new db created with name: %v", db.Name())

	ctx := context.Background()
	sCol := db.Collection("schema")
	mCol := db.Collection("model")

	_, err := sCol.InsertMany(ctx, []any{s1, s2, s3})
	assert.NoError(t, err)

	_, err = mCol.InsertMany(ctx, []any{m1, m2, m3})
	assert.NoError(t, err)

	err = RefFieldSchema(ctx, os.Getenv("REEARTH_CMS_DB"), db.Name(), true)
	assert.NoError(t, err)

	s1Updated := map[string]any{}
	err = sCol.FindOne(ctx, bson.M{"id": s1ID}).Decode(&s1Updated)
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"_id": s1Updated["_id"],
		"id":  s1ID,
		"fields": primitive.A{
			map[string]any{
				"id": "1",
				"typeproperty": map[string]any{
					"type": "reference",
					"reference": map[string]any{
						"model":               m2ID,
						"schema":              s2ID,
						"correspondingschema": s2ID,
					},
				},
			},
			map[string]any{
				"id": "2",
				"typeproperty": map[string]any{
					"type": "reference",
					"reference": map[string]any{
						"model":               m3ID,
						"schema":              s3ID,
						"correspondingschema": s3ID,
						"correspondingfield":  "3",
					},
				},
			},
		},
	}, s1Updated)

	s2Updated := mongodoc.SchemaDocument{}
	err = sCol.FindOne(ctx, bson.M{"id": s2ID}).Decode(&s2Updated)
	assert.NoError(t, err)

	s3Updated := map[string]any{}
	err = sCol.FindOne(ctx, bson.M{"id": s3ID}).Decode(&s3Updated)
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{
		"_id": s3Updated["_id"],
		"id":  s3ID,
		"fields": primitive.A{
			map[string]any{
				"id": "3",
				"typeproperty": map[string]any{
					"type": "reference",
					"reference": map[string]any{
						"model":               m1ID,
						"schema":              s1ID,
						"correspondingschema": s1ID,
						"correspondingfield":  "2",
					},
				},
			},
		},
	}, s3Updated)
}
