package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

func FromValueType(t *ValueType) value.Type {
	if t == nil {
		return ""
	}
	switch *t {
	case ValueTypeText:
		return value.TypeText
	case ValueTypeTextArea:
		return value.TypeTextArea
	case ValueTypeRichText:
		return value.TypeRichText
	case ValueTypeMarkdown:
		return value.TypeMarkdown
	case ValueTypeAsset:
		return value.TypeAsset
	case ValueTypeDate:
		return value.TypeDateTime
	case ValueTypeBool:
		return value.TypeBool
	case ValueTypeSelect:
		return value.TypeSelect
	case ValueTypeInteger:
		return value.TypeInteger
	case ValueTypeReference:
		return value.TypeReference
	case ValueTypeUrl:
		return value.TypeURL
	case ValueTypeTag:
		return value.TypeTag
	case ValueTypeGroup:
		return value.TypeGroup
	default:
		return value.TypeUnknown
	}
}

func ToValueType(t value.Type) ValueType {
	switch t {
	case value.TypeText:
		return ValueTypeText
	case value.TypeTextArea:
		return ValueTypeTextArea
	case value.TypeRichText:
		return ValueTypeRichText
	case value.TypeMarkdown:
		return ValueTypeMarkdown
	case value.TypeAsset:
		return ValueTypeAsset
	case value.TypeDateTime:
		return ValueTypeDate
	case value.TypeBool:
		return ValueTypeBool
	case value.TypeSelect:
		return ValueTypeSelect
	case value.TypeInteger:
		return ValueTypeInteger
	case value.TypeReference:
		return ValueTypeReference
	case value.TypeURL:
		return ValueTypeUrl
	case value.TypeGroup:
		return ValueTypeGroup
	case value.TypeTag:
		return ValueTypeTag
	case value.TypeCheckbox:
		return ValueTypeCheckbox
	default:
		return ""
	}
}

func ToValues(v *value.Multiple, sf *schema.Field, assets *AssetContext) any {
	if !sf.Multiple() {
		return ToValue(v.First(), sf, assets)
	}
	return lo.Map(v.Values(), func(v *value.Value, _ int) any {
		return ToValue(v, sf, assets)
	})
}

func ToValue(v *value.Value, sf *schema.Field, assets *AssetContext) any {
	if assets != nil {
		if aid, ok := v.ValueAsset(); ok {
			if a2 := assets.ResolveAsset(aid); a2 != nil {
				return a2
			}
		}
	}

	if sf.Type() == value.TypeTag {
		var tag *schema.FieldTag
		sf.TypeProperty().Match(schema.TypePropertyMatch{
			Tag: func(f *schema.FieldTag) {
				tag = f
			},
		})
		str, ok := v.ValueString()
		if !ok {
			return nil
		}
		tid, err := id.TagIDFrom(str)
		if err != nil {
			return nil
		}
		res := tag.Tags().FindByID(tid)
		return TagResponse{
			Color: lo.ToPtr(res.Color().String()),
			Id:    res.ID().Ref(),
			Name:  lo.ToPtr(res.Name()),
		}
	}
	return v.Interface()
}

type AssetContext struct {
	Map     asset.Map
	Files   map[asset.ID]*asset.File
	BaseURL func(a *asset.Asset) string
	All     bool
}

func (c *AssetContext) ResolveAsset(id asset.ID) *Asset {
	if c.Map != nil {
		if a, ok := c.Map[id]; ok {
			var aurl string
			if c.BaseURL != nil {
				aurl = c.BaseURL(a)
			}

			var f *asset.File
			if c.Files != nil {
				f = c.Files[id]
			}

			return NewAsset(a, f, aurl, c.All)
		}
	}
	return nil
}
