package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/stretchr/testify/assert"
)

func TestNewQuery(t *testing.T) {
	mid := id.NewModelID()
	pid := id.NewProjectID()
	str := "foo"
	type args struct {
		project id.ProjectID
		schema  *id.SchemaID
		q       string
		ref     *version.Ref
	}
	tests := []struct {
		name string
		args args
		want *Query
	}{
		{
			name: "",
			args: args{
				project: pid,
				q:       str,
				ref:     version.Public.Ref(),
			},
			want: &Query{
				project: pid,
				model:   mid,
				q:       "foo",
				ref:     version.Public.Ref(),
			},
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			got := NewQuery(tc.args.project, mid, tc.args.schema, tc.args.q, tc.args.ref)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestQuery_WithSort(t *testing.T) {
	q := &Query{}
	s := &view.Sort{}
	assert.Equal(t, q, q.WithSort(s))
	assert.Equal(t, s, q.Sort())
}

func TestQuery_WithFilter(t *testing.T) {
	q := &Query{}
	f := &view.Condition{}
	assert.Equal(t, q, q.WithFilter(f))
	assert.Equal(t, f, q.Filter())
}

func TestQuery_Project(t *testing.T) {
	pid := id.NewProjectID()
	q := &Query{
		project: pid,
	}
	assert.Equal(t, pid, q.Project())
}

func TestQuery_Model(t *testing.T) {
	mid := id.NewModelID()
	q := &Query{
		model: mid,
	}
	assert.Equal(t, mid, q.Model())
}

func TestQuery_Schema(t *testing.T) {
	sId := id.NewSchemaID()
	q := &Query{
		schema: &sId,
	}
	assert.Equal(t, &sId, q.Schema())
}

func TestQuery_Q(t *testing.T) {
	str := "foo"
	q := &Query{
		q: str,
	}
	assert.Equal(t, str, q.Q())
}

func TestQuery_Ref(t *testing.T) {
	q := &Query{
		ref: version.Public.Ref(),
	}
	assert.Equal(t, version.Public.Ref(), q.Ref())
}

func TestQuery_Sort(t *testing.T) {
	s := &view.Sort{}
	q := &Query{
		sort: s,
	}
	assert.Equal(t, s, q.Sort())
}

func TestQuery_Filter(t *testing.T) {
	f := &view.Condition{}
	q := &Query{
		filter: f,
	}
	assert.Equal(t, f, q.Filter())
}

func TestQuery_ItemFields(t *testing.T) {
	q := &Query{}
	assert.False(t, q.HasItemFields())
	assert.Equal(t, view.FieldSelectorList{}, q.ItemFields())
	fID := id.NewFieldID()
	f := view.FieldSelector{
		Type: view.FieldTypeField,
		ID:   &fID,
	}
	q = &Query{
		sort: &view.Sort{
			Field: f,
		},
	}
	assert.True(t, q.HasItemFields())
	assert.Equal(t, view.FieldSelectorList{f}, q.ItemFields())

	q = &Query{
		filter: &view.Condition{
			ConditionType: view.ConditionTypeBasic,
			BasicCondition: &view.BasicCondition{
				Field: f,
			},
		},
	}
	assert.True(t, q.HasItemFields())
	assert.Equal(t, view.FieldSelectorList{f}, q.ItemFields())
}

func TestQuery_MetaFields(t *testing.T) {
	q := &Query{}
	assert.False(t, q.HasMetaFields())
	assert.Equal(t, view.FieldSelectorList{}, q.ItemFields())
	fID := id.NewFieldID()
	f := view.FieldSelector{
		Type: view.FieldTypeMetaField,
		ID:   &fID,
	}
	q = &Query{
		sort: &view.Sort{
			Field: f,
		},
	}
	assert.True(t, q.HasMetaFields())
	assert.Equal(t, view.FieldSelectorList{f}, q.MetaFields())

	q = &Query{
		filter: &view.Condition{
			ConditionType: view.ConditionTypeBasic,
			BasicCondition: &view.BasicCondition{
				Field: f,
			},
		},
	}
	assert.True(t, q.HasMetaFields())
	assert.Equal(t, view.FieldSelectorList{f}, q.MetaFields())
}

func TestQuery_Fields(t *testing.T) {
	q := &Query{}
	assert.Equal(t, view.FieldSelectorList{}, q.Fields())
	fID := id.NewFieldID()
	f := view.FieldSelector{
		Type: view.FieldTypeField,
		ID:   &fID,
	}
	mf := view.FieldSelector{
		Type: view.FieldTypeMetaField,
		ID:   &fID,
	}
	q = &Query{
		sort: &view.Sort{
			Field: f,
		},
	}
	assert.Equal(t, view.FieldSelectorList{f}, q.Fields())

	q = &Query{
		sort: &view.Sort{
			Field: f,
		},
		filter: &view.Condition{
			ConditionType: view.ConditionTypeBasic,
			BasicCondition: &view.BasicCondition{
				Field: mf,
			},
		},
	}
	assert.Equal(t, view.FieldSelectorList{f, mf}, q.Fields())
}
