package item

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
	"golang.org/x/exp/slices"
)

type FieldChangeType string

const (
	FieldChangeTypeAdd    FieldChangeType = "add"
	FieldChangeTypeUpdate FieldChangeType = "update"
	FieldChangeTypeDelete FieldChangeType = "delete"
)

type FieldChanges []FieldChange

type FieldChange struct {
	ID            FieldID
	Type          FieldChangeType
	CurrentValue  *value.Multiple
	PreviousValue *value.Multiple
}

func CompareFields(n, o Fields) FieldChanges {
	nFields, oFields := n.Map(), o.Map()

	changes := make([]FieldChange, 0, len(nFields)+len(oFields))

	for fieldID, newField := range nFields {
		oldField, exists := oFields[fieldID]

		if !exists {
			// add
			change := FieldChange{
				ID:            fieldID,
				Type:          FieldChangeTypeAdd,
				PreviousValue: nil,
				CurrentValue:  newField.Value(),
			}

			changes = append(changes, change)
			continue
		}

		if newField.Value().Equal(oldField.Value()) {
			continue
		}

		// update
		change := FieldChange{
			ID:            fieldID,
			Type:          FieldChangeTypeUpdate,
			PreviousValue: oldField.Value(),
			CurrentValue:  newField.Value(),
		}

		changes = append(changes, change)
	}

	for fieldID, oldField := range oFields {
		if _, exists := nFields[fieldID]; exists {
			continue
		}

		// delete
		change := FieldChange{
			ID:            fieldID,
			Type:          FieldChangeTypeDelete,
			PreviousValue: oldField.Value(),
			CurrentValue:  nil,
		}

		changes = append(changes, change)
	}

	slices.SortFunc(changes, func(a, b FieldChange) int {
		return a.ID.Timestamp().Compare(b.ID.Timestamp())
	})

	return changes
}
