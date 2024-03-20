package view

import "github.com/reearth/reearth-cms/server/pkg/id"

type FieldType string

const (
	FieldTypeId               FieldType = "ID"
	FieldTypeCreationDate     FieldType = "CREATIONDATE"
	FieldTypeCreationUser     FieldType = "CREATIONUSER"
	FieldTypeModificationDate FieldType = "MODIFICATIONDATE"
	FieldTypeModificationUser FieldType = "MODIFICATIONUSER"
	FieldTypeStatus           FieldType = "STATUS"

	FieldTypeField     FieldType = "FIELD"
	FieldTypeMetaField FieldType = "METAFIELD"
)

type FieldSelector struct {
	Type FieldType
	ID   *id.FieldID
}

type FieldSelectorList []FieldSelector
