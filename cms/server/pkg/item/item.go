package item

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"

	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type Item struct {
	id                   ID
	schema               SchemaID
	model                ModelID
	project              ProjectID
	fields               []*Field
	timestamp            time.Time
	thread               ThreadID
	isMetadata           bool
	user                 *UserID
	updatedByUser        *UserID
	updatedByIntegration *IntegrationID
	metadataItem         *id.ItemID
	originalItem         *id.ItemID
	integration          *IntegrationID
}

type Versioned = *version.Value[*Item]

func (i *Item) ID() ID {
	return i.id
}

func (i *Item) User() *UserID {
	return i.user
}

func (i *Item) Integration() *IntegrationID {
	return i.integration
}

func (i *Item) Fields() Fields {
	return slices.Clone(i.fields)
}

func (i *Item) Project() ProjectID {
	return i.project
}

func (i *Item) Model() ModelID {
	return i.model
}

func (i *Item) Schema() SchemaID {
	return i.schema
}

func (i *Item) Timestamp() time.Time {
	return i.timestamp
}

func (i *Item) MetadataItem() *ID {
	return i.metadataItem
}
func (i *Item) IsMetadata() bool {
	return i.isMetadata
}

func (i *Item) OriginalItem() *ID {
	return i.originalItem
}

func (i *Item) Field(f FieldID) *Field {
	ff, _ := lo.Find(i.fields, func(g *Field) bool {
		return g.FieldID() == f
	})
	return ff
}

func (i *Item) FieldByItemGroupAndID(fid FieldID, igID ItemGroupID) *Field {
	ff, _ := lo.Find(i.fields, func(g *Field) bool {
		if g.group == nil {
			return false
		}
		return g.FieldID() == fid && *g.group == igID
	})
	return ff
}

func (i *Item) Thread() ThreadID {
	return i.thread
}

func (i *Item) UpdatedByUser() *UserID {
	return i.updatedByUser
}

func (i *Item) UpdatedByIntegration() *IntegrationID {
	return i.updatedByIntegration
}

func (i *Item) SetUpdatedByIntegration(u IntegrationID) {
	i.updatedByIntegration = &u
	i.updatedByUser = nil
}

func (i *Item) SetUpdatedByUser(u UserID) {
	i.updatedByUser = &u
	i.updatedByIntegration = nil
}

func (i *Item) UpdateFields(fields []*Field) {
	if fields == nil {
		return
	}

	newFields := lo.Filter(fields, func(field *Field, _ int) bool {
		if field == nil {
			return false
		}
		if field.ItemGroup() == nil {
			return i.Field(field.field) == nil
		}
		return i.FieldByItemGroupAndID(field.FieldID(), *field.ItemGroup()) == nil
	})

	i.fields = append(lo.FilterMap(i.fields, func(f *Field, _ int) (*Field, bool) {
		ff, found := lo.Find(fields, func(g *Field) bool {
			if g == nil || f == nil {
				return false
			}
			if g.group == nil || f.group == nil {
				return g.FieldID() == f.FieldID()
			}
			return g.FieldID() == f.FieldID() && *g.group == *f.group
		})

		if !found {
			return f, true
		}

		return ff, true
	}), newFields...)

	i.cleanGroups()

	i.timestamp = util.Now()
}

func (i *Item) cleanGroups() {
	i.fields = lo.Filter(i.fields, func(f *Field, _ int) bool {
		if f.ItemGroup() == nil {
			return true
		}
		for _, gf := range i.Fields().FieldsByType(value.TypeGroup) {
			igs, ok := gf.value.ValuesGroup()
			if !ok {
				continue
			}
			for _, ig := range igs {
				if *f.ItemGroup() == ig {
					return true
				}
			}
		}
		return false
	})
	i.timestamp = util.Now()
}

func (i *Item) ClearField(fid FieldID) {
	i.fields = lo.FilterMap(i.fields, func(f *Field, _ int) (*Field, bool) {
		return f, f.FieldID() != fid
	})

	i.timestamp = util.Now()
}

func (i *Item) ClearReferenceFields() {
	i.fields = lo.FilterMap(i.fields, func(f *Field, _ int) (*Field, bool) {
		return f, f.Type() != value.TypeReference
	})

	i.timestamp = util.Now()
}

func (i *Item) FilterFields(list FieldIDList) *Item {
	if i == nil || list == nil {
		return nil
	}

	fields := lo.Filter(i.fields, func(f *Field, i int) bool {
		return list.Has(f.FieldID())
	})
	i.fields = fields
	return i
}

func (i *Item) HasField(fid FieldID, value any) bool {
	for _, field := range i.fields {
		if field.field == fid && field.value == value {
			return true
		}
	}
	return false
}

func (i *Item) AssetIDs() AssetIDList {
	fm := lo.FlatMap(i.fields, func(f *Field, _ int) []*value.Value {
		return f.Value().Values()
	})
	return lo.FilterMap(fm, func(v *value.Value, _ int) (AssetID, bool) {
		return v.ValueAsset()
	})
}

func (i *Item) GetTitle(s *schema.Schema) *string {
	if s == nil || s.TitleField() == nil {
		return nil
	}
	sf := s.Field(*s.TitleField())
	if sf == nil {
		return nil
	}
	f := i.Field(sf.ID())
	if f == nil {
		return nil
	}
	vv, ok := f.Value().First().Value().(string)
	if !ok {
		return nil
	}
	return &vv
}

type ItemModelSchema struct {
	Item            *Item
	ReferencedItems []Versioned
	Model           *model.Model
	Schema          *schema.Schema
	GroupSchemas    schema.List
	Changes         FieldChanges
}

func (i *Item) SetMetadataItem(iid id.ItemID) {
	i.metadataItem = &iid
}

func (i *Item) SetOriginalItem(iid id.ItemID) {
	i.originalItem = &iid
}
