package integrationapi

import (
	"github.com/oapi-codegen/runtime/types"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func NewVersionedItem(ver item.Versioned, s *schema.Schema, assets *AssetContext, f *[]VersionedItem, ms *schema.Schema, mi item.Versioned, sgl schema.List) VersionedItem {
	ps := lo.Map(ver.Parents().Values(), func(v version.Version, _ int) types.UUID {
		return types.UUID(v)
	})
	rs := lo.Map(ver.Refs().Values(), func(r version.Ref, _ int) string {
		return string(r)
	})
	var metaFields *[]Field
	if mi != nil && ms != nil {
		metaFields = NewItem(mi.Value(), schema.List{ms}, nil).Fields
	}

	ii := NewItem(ver.Value(), append(sgl, s), assets)
	return VersionedItem{
		Id:              ii.Id,
		CreatedAt:       ii.CreatedAt,
		UpdatedAt:       ii.UpdatedAt,
		Fields:          ii.Fields,
		ModelId:         ii.ModelId,
		Parents:         &ps,
		MetadataFields:  metaFields,
		IsMetadata:      lo.ToPtr(ver.Value().IsMetadata()),
		Refs:            &rs,
		Version:         lo.ToPtr(types.UUID(ver.Version())),
		ReferencedItems: f,
	}
}

func NewItem(i *item.Item, ss schema.List, assets *AssetContext) Item {
	var fs []Field
	for _, s := range ss {
		t := lo.FilterMap(i.Fields(), func(f *item.Field, _ int) (Field, bool) {
			if s == nil {
				return Field{}, false
			}
			sf := s.Field(f.FieldID())
			if sf == nil {
				return Field{}, false
			}

			return Field{
				Id:    f.FieldID().Ref(),
				Type:  lo.ToPtr(ToValueType(f.Type())),
				Value: lo.ToPtr(ToValues(f.Value(), sf, assets)),
				Key:   util.ToPtrIfNotEmpty(sf.Key().String()),
				Group: f.ItemGroup(),
			}, true
		})
		fs = append(fs, t...)
	}

	return Item{
		Id:             i.ID().Ref(),
		ModelId:        i.Model().Ref().StringRef(),
		Fields:         &fs,
		MetadataItemId: i.MetadataItem(),
		OriginalItemId: i.OriginalItem(),
		IsMetadata:     lo.ToPtr(i.IsMetadata()),
		CreatedAt:      lo.ToPtr(i.ID().Timestamp()),
		UpdatedAt:      lo.ToPtr(i.Timestamp()),
	}
}
