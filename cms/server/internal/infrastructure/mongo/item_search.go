package mongo

import (
	"context"
	"fmt"
	"regexp"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.opencensus.io/trace"
)

func (r *Item) Search(ctx context.Context, sp schema.Package, query *item.Query, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	_, span := trace.StartSpan(ctx, "mongo/item/search")
	t := time.Now()
	defer func() { span.End(); log.Infof("trace: mongo/item/search %s", time.Since(t)) }()

	res, pi, err := r.paginateAggregation(ctx, buildPipeline(query, sp), query.Ref(), sort(query), pagination)
	return res, pi, err
}

func buildPipeline(query *item.Query, sp schema.Package) []any {
	// apply basic filter like project, model, schema
	pipeline := []any{basicFilterStage(query)}

	// if the query has any meta fields, lookup the meta item
	if query.HasMetaFields() {
		pipeline = append(pipeline, lookupMetaItem()...)
	}

	pipeline = append(pipeline, fieldAliasStage())

	// lockup referenced item and set alias fields
	for _, f := range sp.Schema().FieldsByType(value.TypeReference) {
		if f == nil {
			continue
		}
		rs := sp.ReferencedSchema(f.ID())
		if rs == nil || rs.TitleField() == nil {
			continue
		}
		pipeline = append(pipeline, lookupReferencedField(*f, *rs.TitleField())...)
	}

	// lockup assets and set alias fields
	for _, f := range sp.Schema().FieldsByType(value.TypeAsset) {
		if f == nil {
			continue
		}
		pipeline = append(pipeline, lookupAssetField(*f)...)
	}

	// create aliases for fields used in filter logic or sort
	pipeline = append(pipeline, basicFieldsAliasStages(query, sp)...)

	// apply text filter
	if query.Q() != "" {
		pipeline = append(pipeline, textFilterStage(query.Q(), sp))
	}

	// apply filters and sort to pipeline
	filterStage := filter(query.Filter(), sp)
	if filterStage != nil {
		pipeline = append(pipeline, bson.M{"$match": filterStage})
	}
	return pipeline
}

func sort(query *item.Query) *usecasex.Sort {
	var s *usecasex.Sort
	if query.Sort() != nil {
		reverted := query.Sort().Direction == view.DirectionDesc
		s = &usecasex.Sort{
			Key:      fieldKey(query.Sort().Field),
			Reverted: reverted,
		}
	}
	return s
}

func basicFilterStage(query *item.Query) any {
	filter := bson.M{
		"project": query.Project().String(),
		"modelid": query.Model().String(),
	}
	if query.Schema() != nil {
		filter["schema"] = query.Schema().String()
	}
	return bson.M{"$match": filter}
}

func lookupMetaItem() []any {
	return []any{
		bson.M{
			"$lookup": bson.M{
				"from":         "item",
				"localField":   "metadataitem",
				"foreignField": "id",
				"as":           "__temp.meta",
				"pipeline": []bson.M{
					{
						"$match": bson.M{
							"__":  bson.M{"$exists": false},
							"__r": bson.M{"$in": bson.A{"latest"}},
						},
					},
					{
						"$limit": 1,
					},
				},
			},
		},
		bson.M{
			"$unwind": "$__temp.meta",
		},
	}
}

func fieldAliasStage() any {
	return bson.M{
		"$set": bson.M{
			"__temp.fields": bson.M{
				"$arrayToObject": bson.M{
					"$map": bson.M{
						"input": bson.M{"$concatArrays": bson.A{
							"$fields",
							bson.M{"$ifNull": bson.A{"$__temp.meta.fields", bson.A{}}},
						}},
						"as": "f",
						"in": bson.M{
							"k": "$$f.f",
							"v": "$$f.v.v",
						},
					},
				},
			},
		},
	}
}

func lookupReferencedField(f schema.Field, tfID id.FieldID) []any {
	return []any{
		bson.M{
			"$lookup": bson.M{
				"from":         "item",
				"localField":   "__temp.fields." + f.ID().String(),
				"foreignField": "id",
				"as":           "__temp.&" + f.ID().String(),
				"pipeline": []bson.M{
					{
						"$match": bson.M{
							"__":  bson.M{"$exists": false},
							"__r": bson.M{"$in": bson.A{"latest"}},
						},
					},
					{
						"$limit": 1,
					},
					{
						"$set": bson.M{
							"__temp.fields": bson.M{
								"$arrayToObject": bson.M{
									"$map": bson.M{
										"input": "$fields",
										"as":    "f",
										"in": bson.M{
											"k": "$$f.f",
											"v": "$$f.v.v",
										},
									},
								},
							},
						},
					},
				},
			},
		},
		bson.M{
			"$set": bson.M{
				"__temp.fields." + f.ID().String(): bson.M{"$arrayElemAt": bson.A{"$__temp.&" + f.ID().String() + ".__temp.fields." + tfID.String(), 0}},
				//"__temp.fields." + f.ID().String(): "$__temp.&" + f.ID().String() + ".__temp.fields." + tfID.String(),
			},
		},
	}
}

func lookupAssetField(f schema.Field) []any {
	return []any{
		bson.M{
			"$lookup": bson.M{
				"from":         "asset",
				"localField":   "__temp.fields." + f.ID().String(),
				"foreignField": "id",
				"as":           "__temp.&" + f.ID().String(),
				"pipeline": []bson.M{
					{"$limit": 1},
					{"$project": bson.M{"filename": 1}},
				},
			},
		},
		bson.M{
			"$set": bson.M{
				"__temp.fields." + f.ID().String(): "$__temp.&" + f.ID().String() + ".filename",
			},
		},
	}
}

func basicFieldsAliasStages(query *item.Query, sp schema.Package) []any {
	basicAliases := bson.M{
		"__temp.createdBy": bson.M{"$ifNull": bson.A{"$user", "$integration"}},
		"__temp.createdAt": "$timestamp",
		"__temp.updatedBy": bson.M{"$ifNull": bson.A{"$updatedbyuser", "$updatedbyintegration"}},
		"__temp.updatedAt": "$timestamp",
	}

	stages := []any{
		bson.M{"$set": lo.Assign( /*aliases,*/ basicAliases)},
		bson.M{"$set": bson.M{
			"__temp.createdAt": resetTime("$__temp.createdAt"),
			"__temp.updatedAt": resetTime("$__temp.updatedAt"),
		}},
	}

	// parse dates and reset time part of the dates included in the filter
	resetTimeAliases := bson.M{}
	for _, fs := range query.Fields() {
		if fs.ID == nil {
			continue
		}
		f := sp.Field(*fs.ID)
		if f != nil && f.Type() == value.TypeDateTime {
			resetTimeAliases["__temp.fields."+fs.ID.String()] = bson.M{
				"$map": bson.M{
					"input": "$__temp.fields." + fs.ID.String(),
					"as":    "date",
					"in":    resetTime("$$date"),
				},
			}
		}
	}
	stages = append(stages, bson.M{"$set": resetTimeAliases})

	return stages
}

func resetTime(dateField string) bson.M {
	return bson.M{
		"$dateFromParts": bson.M{
			"year":        bson.M{"$year": bson.M{"$toDate": dateField}},
			"month":       bson.M{"$month": bson.M{"$toDate": dateField}},
			"day":         bson.M{"$dayOfMonth": bson.M{"$toDate": dateField}},
			"hour":        0,
			"minute":      0,
			"second":      0,
			"millisecond": 0,
		},
	}
}

func textFilterStage(keyword string, sp schema.Package) any {
	regex := primitive.Regex{Pattern: fmt.Sprintf(".*%s.*", regexp.QuoteMeta(keyword)), Options: "i"}
	var f []bson.M
	for _, k := range textSearchFieldKeys(sp) {
		f = append(f, bson.M{k: regex})
	}
	return bson.M{"$match": bson.M{"$or": f}}
}

func textSearchFieldKeys(sp schema.Package) []string {
	var keys []string
	for _, f := range sp.Schema().Fields() {
		k := "__temp.fields." + f.ID().String()
		if !f.Multiple() {
			k += ".0"
		}
		keys = append(keys, k)
	}
	return keys
}

func filter(c *view.Condition, sp schema.Package) any {
	if c == nil {
		return nil
	}
	ff := bson.M{}
	switch c.ConditionType {
	case view.ConditionTypeBasic:
		ff = lo.Assign(ff, filterBasic(c, sp))
	case view.ConditionTypeNullable:
		ff = lo.Assign(ff, filterNullable(c, sp))
	case view.ConditionTypeBool:
		ff = lo.Assign(ff, filterBool(c, sp))
	case view.ConditionTypeString:
		ff = lo.Assign(ff, filterString(c, sp))
	case view.ConditionTypeNumber:
		ff = lo.Assign(ff, filterNumber(c, sp))
	case view.ConditionTypeTime:
		ff = lo.Assign(ff, filterDate(c, sp))
	case view.ConditionTypeMultiple:
		ff = lo.Assign(ff, filterMultiple(c, sp))
	case view.ConditionTypeAnd:
		ff["$and"] = lo.Map(c.AndCondition.Conditions, func(c view.Condition, _ int) any {
			return filter(&c, sp)
		})
	case view.ConditionTypeOr:
		ff["$or"] = lo.Map(c.OrCondition.Conditions, func(c view.Condition, _ int) any {
			return filter(&c, sp)
		})
	default:
		return nil
	}
	return ff
}

func filterMultiple(c *view.Condition, _ schema.Package) bson.M {
	f := bson.M{}
	switch c.MultipleCondition.Op {
	case view.MultipleOperatorIncludesAny:
		f[fieldKey(c.MultipleCondition.Field)] = bson.M{"$in": c.MultipleCondition.Value}
	case view.MultipleOperatorIncludesAll:
		f[fieldKey(c.MultipleCondition.Field)] = bson.M{"$all": c.MultipleCondition.Value}
	case view.MultipleOperatorNotIncludesAny:
		f[fieldKey(c.MultipleCondition.Field)] = bson.M{"$nin": c.MultipleCondition.Value}
	case view.MultipleOperatorNotIncludesAll:
		f[fieldKey(c.MultipleCondition.Field)] = bson.M{"$not": bson.M{"$all": c.MultipleCondition.Value}}
	}
	return f
}

func filterDate(c *view.Condition, _ schema.Package) bson.M {
	f := bson.M{}
	v := c.TimeCondition.Value.Truncate(24 * time.Hour)
	switch c.TimeCondition.Op {
	case view.TimeOperatorAfter:
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$gt": v}
	case view.TimeOperatorAfterOrOn:
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$gte": v}
	case view.TimeOperatorBefore:
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$lt": v}
	case view.TimeOperatorBeforeOrOn:
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$lte": v}
	case view.TimeOperatorOfThisWeek:
		v = startDayOfWeek(util.Now())
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$gte": v}
	case view.TimeOperatorOfThisMonth:
		v = startDayOfMonth(util.Now())
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$gte": v}
	case view.TimeOperatorOfThisYear:
		v = startDayOfYear(util.Now())
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$gte": v}
	}
	return f
}

func startDayOfWeek(t time.Time) time.Time {
	weekday := time.Duration(t.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	return t.Truncate(24 * time.Hour).Add(-1 * (weekday - 1) * 24 * time.Hour)
}

func startDayOfMonth(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, t.Location())
}

func startDayOfYear(t time.Time) time.Time {
	return time.Date(t.Year(), 1, 1, 0, 0, 0, 0, t.Location())
}

func filterNumber(c *view.Condition, _ schema.Package) bson.M {
	f := bson.M{}
	switch c.NumberCondition.Op {
	case view.NumberOperatorGreaterThan:
		f[fieldKey(c.NumberCondition.Field)] = bson.M{"$gt": c.NumberCondition.Value}
	case view.NumberOperatorGreaterThanOrEqualTo:
		f[fieldKey(c.NumberCondition.Field)] = bson.M{"$gte": c.NumberCondition.Value}
	case view.NumberOperatorLessThan:
		f[fieldKey(c.NumberCondition.Field)] = bson.M{"$lt": c.NumberCondition.Value}
	case view.NumberOperatorLessThanOrEqualTo:
		f[fieldKey(c.NumberCondition.Field)] = bson.M{"$lte": c.NumberCondition.Value}
	}
	return f
}

func filterString(c *view.Condition, _ schema.Package) bson.M {
	f := bson.M{}
	switch c.StringCondition.Op {
	case view.StringOperatorContains:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$regex": fmt.Sprintf(".*%s.*", regexp.QuoteMeta(c.StringCondition.Value))}
	case view.StringOperatorNotContains:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$not": bson.M{"$regex": fmt.Sprintf(".*%s.*", regexp.QuoteMeta(c.StringCondition.Value))}}
	case view.StringOperatorStartsWith:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$regex": fmt.Sprintf("^%s", regexp.QuoteMeta(c.StringCondition.Value))}
	case view.StringOperatorNotStartsWith:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$not": bson.M{"$regex": fmt.Sprintf("^%s", regexp.QuoteMeta(c.StringCondition.Value))}}
	case view.StringOperatorEndsWith:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$regex": fmt.Sprintf("%s$", regexp.QuoteMeta(c.StringCondition.Value))}
	case view.StringOperatorNotEndsWith:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$not": bson.M{"$regex": fmt.Sprintf("%s$", regexp.QuoteMeta(c.StringCondition.Value))}}
	}
	return f
}

func filterBool(c *view.Condition, _ schema.Package) bson.M {
	f := bson.M{}
	switch c.BoolCondition.Op {
	case view.BoolOperatorEquals:
		f[fieldKey(c.BoolCondition.Field)] = c.BoolCondition.Value
	case view.BoolOperatorNotEquals:
		f[fieldKey(c.BoolCondition.Field)] = bson.M{"$ne": c.BoolCondition.Value}
	}
	return f
}

func filterNullable(c *view.Condition, _ schema.Package) bson.M {
	f := bson.M{}
	switch c.NullableCondition.Op {
	case view.NullableOperatorEmpty:
		f[fieldKey(c.NullableCondition.Field)] = bson.M{"$exists": false}
	case view.NullableOperatorNotEmpty:
		f[fieldKey(c.NullableCondition.Field)] = bson.M{"$exists": true}
	}
	return f
}

func filterBasic(c *view.Condition, sp schema.Package) bson.M {
	f := bson.M{}
	switch c.BasicCondition.Op {
	case view.BasicOperatorEquals:
		f[fieldKey(c.BasicCondition.Field)] = fieldValue(c.BasicCondition.Field, c.BasicCondition.Value, sp)
	case view.BasicOperatorNotEquals:
		f[fieldKey(c.BasicCondition.Field)] = bson.M{"$ne": fieldValue(c.BasicCondition.Field, c.BasicCondition.Value, sp)}
	}
	return f
}

// returns the field alias key for the given field selector
func fieldKey(f view.FieldSelector) string {
	if f.Type == view.FieldTypeMetaField || f.Type == view.FieldTypeField {
		return "__temp.fields." + f.ID.String() + ".0"
	}
	switch f.Type {
	case view.FieldTypeId:
		return "id"
	case view.FieldTypeCreationDate:
		return "__temp.createdAt"
	case view.FieldTypeCreationUser:
		return "__temp.createdBy"
	case view.FieldTypeModificationDate:
		return "__temp.updateAt"
	case view.FieldTypeModificationUser:
		return "__temp.updatedBy"
	case view.FieldTypeStatus:
		return "status"
	default:
		return "id"
	}
}

// returns the field converted value according to the schema field
func fieldValue(fs view.FieldSelector, v any, sp schema.Package) any {
	if fs.Type == view.FieldTypeMetaField || fs.Type == view.FieldTypeField {
		f := sp.Field(*fs.ID)
		if f != nil && f.Type() == value.TypeDateTime {
			res, _ := time.Parse(time.RFC3339, v.(string))
			return res
		}
		return v
	}
	switch fs.Type {
	case view.FieldTypeId:
		res, _ := idx.From[id.Item](v.(string))
		return res.String()
	case view.FieldTypeCreationDate:
		res, _ := time.Parse(time.RFC3339, v.(string))
		return res.Truncate(24 * time.Hour)
	case view.FieldTypeCreationUser:
		res, _ := idx.From[id.User](v.(string))
		return res.String()
	case view.FieldTypeModificationDate:
		res, _ := time.Parse(time.RFC3339, v.(string))
		return res.Truncate(24 * time.Hour)
	case view.FieldTypeModificationUser:
		res, _ := idx.From[id.User](v.(string))
		return res.String()
	case view.FieldTypeStatus:
		return v
	default:
		return v
	}
}
