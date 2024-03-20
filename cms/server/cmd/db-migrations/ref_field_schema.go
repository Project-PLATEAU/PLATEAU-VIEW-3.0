package main

import (
	"context"
	"fmt"

	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Schema struct {
	ID     string   `bson:"id"`
	Fields []*Field `bson:"fields"`
}

type Field struct {
	ID           string        `bson:"id"`
	TypeProperty *TypeProperty `bson:"typeproperty"`
}

type TypeProperty struct {
	Type      string     `bson:"type"`
	Reference *Reference `bson:"reference"`
}

type Reference struct {
	Model               string  `bson:"model"`
	Schema              string  `bson:"schema"`
	CorrespondingSchema *string `bson:"correspondingschema"`
}

func (r *Reference) SetSchema(s string) {
	r.Schema = s
}

type Model struct {
	ID     string `bson:"id"`
	Schema string `bson:"schema"`
}

func RefFieldSchema(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	testID := ""

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
	sCol := client.Database(dbName).Collection("schema")
	mCol := client.Database(dbName).Collection("model")

	schemas, err := loadSchemas(ctx, sCol)
	if err != nil {
		return err
	}

	if len(schemas) == 0 {
		return fmt.Errorf("no docs found")
	}

	mIds := lo.FlatMap(schemas, func(s Schema, _ int) []string {
		return lo.FilterMap(s.Fields, func(f *Field, _ int) (string, bool) {
			if f.TypeProperty.Type != "reference" {
				return "", false
			}
			return f.TypeProperty.Reference.Model, true
		})
	})
	models, err := loadModels(ctx, mIds, mCol)
	if err != nil {
		return err
	}

	fmt.Printf("%d docs found, first id: %s\n", len(schemas), schemas[0].ID)

	if testID != "" {
		schemas = lo.Filter(schemas, func(s Schema, _ int) bool {
			return s.ID == testID
		})
		fmt.Printf("test mode: filter on '%s', now %d docs selcted\n", testID, len(schemas))
	}

	lo.ForEach(schemas, func(s Schema, _ int) {
		lo.ForEach(s.Fields, func(f *Field, _ int) {
			if f.TypeProperty.Type != "reference" {
				return
			}
			m, ok := models[f.TypeProperty.Reference.Model]
			if ok {
				f.TypeProperty.Reference.SetSchema(m.Schema)
				return
			}
			if f.TypeProperty.Reference.CorrespondingSchema != nil {
				f.TypeProperty.Reference.SetSchema(*f.TypeProperty.Reference.CorrespondingSchema)
				return
			}
			fmt.Printf("no model found for schema '%s' model id '%s'\n", s.ID, f.TypeProperty.Reference.Model)
		})
	})

	// update all documents in col
	writes := lo.FlatMap(schemas, func(s Schema, _ int) []mongo.WriteModel {
		return lo.FilterMap(s.Fields, func(f *Field, _ int) (mongo.WriteModel, bool) {
			if f.TypeProperty.Type != "reference" {
				return nil, false
			}
			fmt.Printf("updating schema '%s' field '%s' referenced schema '%s'\n", s.ID, f.ID, f.TypeProperty.Reference.Schema)
			return mongo.NewUpdateOneModel().
				SetFilter(bson.M{
					"id":        s.ID,
					"fields.id": f.ID,
				}).
				SetUpdate(bson.M{
					"$set": bson.M{
						"fields.$[f].typeproperty.reference.schema": f.TypeProperty.Reference.Schema,
					},
				}).
				SetArrayFilters(options.ArrayFilters{
					Filters: []interface{}{bson.M{"f.id": f.ID}},
				}), true
		})
	})

	if !wetRun {
		fmt.Printf("dry run\n")
		fmt.Printf("%d docs will be updated\n", len(writes))
		return nil
	}

	fmt.Printf("writing docs...")
	res, err := sCol.BulkWrite(ctx, writes)
	if err != nil {
		return fmt.Errorf("failed to bulk write: %w", err)
	}

	fmt.Printf("%d docs updated\n", res.ModifiedCount)
	return nil
}

func loadSchemas(ctx context.Context, col *mongo.Collection) ([]Schema, error) {
	cur, err := col.Find(
		ctx,
		bson.M{"fields.typeproperty.type": "reference"},
		options.Find().SetProjection(bson.M{"id": 1, "fields": 1}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find schemas docs: %w", err)
	}

	var schemas []Schema
	err = cur.All(ctx, &schemas)
	if err != nil {
		return nil, fmt.Errorf("failed to decode schemas docs: %w", err)
	}
	return schemas, nil
}

func loadModels(ctx context.Context, sIDs []string, col *mongo.Collection) (map[string]Model, error) {
	cur, err := col.Find(
		ctx,
		bson.M{"id": bson.M{"$in": sIDs}},
		options.Find().SetProjection(bson.M{"id": 1, "schema": 1}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find models docs: %w", err)
	}

	var models []Model
	err = cur.All(ctx, &models)
	if err != nil {
		return nil, fmt.Errorf("failed to decode models docs: %w", err)
	}
	return lo.SliceToMap(models, func(m Model) (string, Model) {
		return m.ID, m

	}), nil
}
