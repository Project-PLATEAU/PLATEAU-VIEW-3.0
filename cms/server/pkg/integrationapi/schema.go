package integrationapi

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ItemModelSchema struct {
	Item            Item             `json:"item"`
	ReferencedItems []*VersionedItem `json:"referencedItems,omitempty"`
	Model           Model            `json:"model"`
	Schema          Schema           `json:"schema"`
	Changes         []FieldChange    `json:"changes,omitempty"`
}

type FieldChange struct {
	ID            item.FieldID         `json:"id"`
	Type          item.FieldChangeType `json:"type"`
	CurrentValue  any                  `json:"currentValue"`
	PreviousValue any                  `json:"previousValue"`
}

type ItemModelSchemaItemChange struct {
	Item    Item          `json:"item"`
	Model   Model         `json:"model"`
	Schema  Schema        `json:"schema"`
	Changes []FieldChange `json:"changes"`
}

func NewItemModelSchema(i item.ItemModelSchema, assets *AssetContext) ItemModelSchema {
	return ItemModelSchema{
		Item: NewItem(i.Item, append(i.GroupSchemas, i.Schema), assets),
		ReferencedItems: lo.Map(i.ReferencedItems, func(itm *version.Value[*item.Item], _ int) *VersionedItem {
			return lo.ToPtr(NewVersionedItem(itm, nil, nil, nil, nil, nil, nil))
		}),
		Model:   NewModel(i.Model, time.Time{}),
		Schema:  NewSchema(i.Schema),
		Changes: NewItemFieldChanges(i.Changes),
	}
}

func NewModel(m *model.Model, lastModified time.Time) Model {
	var metadata *id.SchemaID
	if m.Metadata() != nil {
		metadata = m.Metadata().Ref()
	}
	return Model{
		Id:               m.ID().Ref(),
		Key:              util.ToPtrIfNotEmpty(m.Key().String()),
		Name:             util.ToPtrIfNotEmpty(m.Name()),
		Description:      util.ToPtrIfNotEmpty(m.Description()),
		Public:           util.ToPtrIfNotEmpty(m.Public()),
		ProjectId:        m.Project().Ref(),
		SchemaId:         m.Schema().Ref(),
		MetadataSchemaId: metadata,
		CreatedAt:        lo.ToPtr(m.ID().Timestamp()),
		UpdatedAt:        lo.ToPtr(m.UpdatedAt()),
		LastModified:     util.ToPtrIfNotEmpty(lastModified),
	}
}

func NewSchema(i *schema.Schema) Schema {
	fs := lo.Map(i.Fields(), func(f *schema.Field, _ int) SchemaField {
		return SchemaField{
			Id:       f.ID().Ref(),
			Type:     lo.ToPtr(ValueType(f.Type())),
			Key:      lo.ToPtr(f.Key().String()),
			Required: lo.ToPtr(f.Required()),
		}
	})
	var tf *id.FieldID
	if i.TitleField() != nil {
		tf = i.TitleField().Ref()
	}

	return Schema{
		Id:         i.ID().Ref(),
		ProjectId:  i.Project().Ref(),
		Fields:     &fs,
		TitleField: tf,
		CreatedAt:  lo.ToPtr(i.ID().Timestamp()),
	}
}

func NewItemFieldChanges(changes item.FieldChanges) []FieldChange {
	transformedChanges := make([]FieldChange, 0, len(changes))

	for _, change := range changes {
		transformedChanges = append(transformedChanges, FieldChange{
			ID:            change.ID,
			CurrentValue:  change.CurrentValue.Interface(),
			PreviousValue: change.PreviousValue.Interface(),
			Type:          change.Type,
		})
	}

	return transformedChanges
}
