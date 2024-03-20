package view

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestView(t *testing.T) {
	// Create an instance of View, v
	v := &View{
		id:        NewID(), // Assuming NewID() gives a unique ID
		name:      "test",
		schema:    NewSchemaID(),  // Assuming NewSchemaID() gives a unique SchemaID
		model:     NewModelID(),   // Assuming NewModelID() gives a unique ModelID
		project:   NewProjectID(), // Assuming NewProjectID() gives a unique ProjectID
		user:      NewUserID(),    // Assuming NewUserID() gives a unique UserID
		updatedAt: time.Now(),
	}

	// Test ID()
	assert.Equal(t, v.id, v.ID())

	// Test Model()
	assert.Equal(t, v.model, v.Model())

	// Test Project()
	assert.Equal(t, v.project, v.Project())

	// Test Name()
	assert.Equal(t, v.name, v.Name())

	// Test User()
	assert.Equal(t, v.user, v.User())

	// Test Schema()
	assert.Equal(t, v.schema, v.Schema())

	// Test UpdatedAt()
	assert.Equal(t, v.updatedAt, v.UpdatedAt())

	// Create new settings for Setters
	newCondition := Condition{} // assuming Condition struct or type exists
	newSort := Sort{}           // assuming Sort struct or type exists
	columns := ColumnList{}     // assuming FieldSelectorList struct or type exists
	updateTime := time.Now()

	// Update fields using Setters
	v.SetName("updatedName")   // Assuming name is "updatedName"
	v.SetSort(&newSort)        // Assuming newSort has been set
	v.SetFilter(&newCondition) // Assuming newCondition has been set
	v.SetColumns(&columns)     // Assuming newFields has been set
	v.SetUpdatedAt(updateTime) // Assuming updateTime has been set

	// Test that updated fields are set correctly
	assert.Equal(t, "updatedName", v.Name())
	assert.Equal(t, &newSort, v.Sort())
	assert.Equal(t, &newCondition, v.Filter())
	assert.Equal(t, &columns, v.Columns())
	assert.Equal(t, updateTime, v.UpdatedAt())

	// Test Clone Function
	cloned := v.Clone()
	assert.EqualValues(t, v, cloned)
}
