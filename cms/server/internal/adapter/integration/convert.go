package integration

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

const maxPerPage = 100
const defaultPerPage int64 = 50

func fromPagination(page, perPage *integrationapi.PageParam) *usecasex.Pagination {
	p := int64(1)
	if page != nil && *page > 0 {
		p = int64(*page)
	}

	pp := defaultPerPage
	if perPage != nil {
		if ppr := *perPage; 1 <= ppr {
			if ppr > maxPerPage {
				pp = int64(maxPerPage)
			} else {
				pp = int64(ppr)
			}
		}
	}

	return usecasex.OffsetPagination{
		Offset: (p - 1) * pp,
		Limit:  pp,
	}.Wrap()
}

func Page(p usecasex.OffsetPagination) int {
	if p.Limit == 0 {
		return 0
	}
	return int(p.Offset/int64(p.Limit)) + 1
}

func fromItemFieldParam(f integrationapi.Field, sf *schema.Field) interfaces.ItemFieldParam {
	var v any = f.Value
	if f.Value != nil {
		v = *f.Value
	}

	var k *key.Key
	if f.Key != nil {
		k = key.New(*f.Key).Ref()
	}

	return interfaces.ItemFieldParam{
		Field: f.Id,
		Key:   k,
		Type:  sf.Type(),
		Value: v,
		Group: f.Group,
	}
}

func convertFields(fields *[]integrationapi.Field, sp *schema.Package, appendDefault, isMeta bool) (res []interfaces.ItemFieldParam) {
	res = []interfaces.ItemFieldParam{}
	if fields == nil {
		fields = &[]integrationapi.Field{}
	}

	for _, field := range *fields {
		sf := sp.FieldByIDOrKey(field.Id, id.NewKeyFromPtr(field.Key))
		if sf == nil {
			continue
		}

		if sf.Type() == value.TypeTag {
			tagNameToId(sf, &field)
		}

		res = append(res, fromItemFieldParam(field, sf))
	}

	if !appendDefault {
		return res
	}

	if isMeta {
		res = appendDefaultValues(sp.MetaSchema(), res, nil)
	} else {
		res = appendDefaultValues(sp.Schema(), res, nil)

		res = appendGroupFieldsDefaultValue(sp, res)
	}
	return res
}

func appendGroupFieldsDefaultValue(sp *schema.Package, res []interfaces.ItemFieldParam) []interfaces.ItemFieldParam {
	gsflist := sp.Schema().FieldsByType(value.TypeGroup)
	for _, gsf := range gsflist {
		var gID id.GroupID
		gsf.TypeProperty().Match(schema.TypePropertyMatch{
			Group: func(f *schema.FieldGroup) {
				gID = f.Group()
			},
		})
		s := sp.GroupSchema(gID)
		if s == nil {
			continue
		}
		igID := id.NewItemGroupID()
		var v any
		v = []id.ItemGroupID{id.NewItemGroupID()}
		if !gsf.Multiple() {
			v = igID
		}
		res = append(res, interfaces.ItemFieldParam{
			Field: gsf.ID().Ref(),
			Key:   gsf.Key().Ref(),
			Type:  gsf.Type(),
			Value: v,
			Group: nil,
		})
		res = appendDefaultValues(s, res, igID.Ref())
	}
	return res
}

func appendDefaultValues(s *schema.Schema, res []interfaces.ItemFieldParam, igID *id.ItemGroupID) []interfaces.ItemFieldParam {
	for _, sf := range s.Fields() {
		if sf.DefaultValue() == nil || sf.DefaultValue().Len() == 0 {
			continue
		}

		exists := lo.ContainsBy(res, func(f interfaces.ItemFieldParam) bool {
			return (f.Field != nil && *f.Field == sf.ID()) && (f.Group != nil && igID != nil && *f.Group == *igID)
		})
		if exists {
			continue
		}
		var v any
		v = sf.DefaultValue().Interface()
		if !sf.Multiple() {
			v = sf.DefaultValue().Interface()[0]
		}
		res = append(res, interfaces.ItemFieldParam{
			Field: sf.ID().Ref(),
			Key:   sf.Key().Ref(),
			Type:  sf.Type(),
			Value: v,
			Group: igID,
		})
	}
	return res
}

func tagNameToId(sf *schema.Field, field *integrationapi.Field) {
	var tagList schema.TagList
	sf.TypeProperty().Match(schema.TypePropertyMatch{
		Tag: func(f *schema.FieldTag) {
			tagList = f.Tags()
		},
	})
	if !sf.Multiple() {
		name := lo.FromPtr(field.Value).(string)
		tag := tagList.FindByName(name)
		if tag != nil {
			var v any = tag.ID()
			field.Value = &v
		}
	} else {
		names := lo.FromPtr(field.Value).([]string)
		tagIDs := util.Map(names, func(n string) id.TagID {
			t := lo.FromPtr(tagList.FindByName(n))
			return t.ID()
		})
		var v any = tagIDs
		field.Value = &v
	}
}
