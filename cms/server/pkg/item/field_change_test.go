package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestCompareFields(t *testing.T) {
	fId := id.NewFieldID()
	fId2 := id.NewFieldID()
	// fId3 := id.NewFieldID()
	// fId4 := id.NewFieldID()

	type args struct {
		n Fields
		o Fields
	}
	tests := []struct {
		name string
		args args
		want FieldChanges
	}{
		{
			name: "no change",
			args: args{
				n: Fields{
					NewField(fId, value.TypeText.Value("value1").AsMultiple(), nil),
					NewField(fId2, value.TypeNumber.Value("value1").AsMultiple(), nil),
				},
				o: Fields{
					NewField(fId, value.TypeText.Value("value1").AsMultiple(), nil),
					NewField(fId2, value.TypeNumber.Value("value1").AsMultiple(), nil),
				},
			},
			want: FieldChanges{}, // No changes expected
		},
		{
			name: "add",
			args: args{
				n: Fields{
					NewField(fId, value.New(value.TypeText, "value1").AsMultiple(), nil),
					NewField(fId2, value.New(value.TypeText, "new field").AsMultiple(), nil),
				},
				o: Fields{
					NewField(fId, value.New(value.TypeText, "value1").AsMultiple(), nil),
				},
			},
			want: FieldChanges{
				{
					ID:            fId2,
					Type:          FieldChangeTypeAdd,
					CurrentValue:  value.New(value.TypeText, "new field").AsMultiple(),
					PreviousValue: nil,
				},
			},
		},
		{
			name: "update",
			args: args{
				n: Fields{
					NewField(fId, value.New(value.TypeText, "value2").AsMultiple(), nil),
					NewField(fId2, value.New(value.TypeNumber, 42).AsMultiple(), nil),
				},
				o: Fields{
					NewField(fId, value.New(value.TypeText, "value1").AsMultiple(), nil),
					NewField(fId2, value.New(value.TypeNumber, 42).AsMultiple(), nil),
				},
			},
			want: FieldChanges{
				{
					ID:            fId,
					Type:          FieldChangeTypeUpdate,
					PreviousValue: value.New(value.TypeText, "value1").AsMultiple(),
					CurrentValue:  value.New(value.TypeText, "value2").AsMultiple(),
				},
			},
		},
		{
			name: "delete",
			args: args{
				n: Fields{
					NewField(fId, value.New(value.TypeText, "value1").AsMultiple(), nil),
				},
				o: Fields{
					NewField(fId, value.New(value.TypeText, "value1").AsMultiple(), nil),
					NewField(fId2, value.New(value.TypeText, "to be deleted").AsMultiple(), nil),
				},
			},
			want: FieldChanges{
				{
					ID:            fId2,
					Type:          FieldChangeTypeDelete,
					CurrentValue:  nil,
					PreviousValue: value.New(value.TypeText, "to be deleted").AsMultiple(),
				},
			},
		},
		// TODO: Flasky test
		// {
		// 	name: "multiple changes",
		// 	args: args{
		// 		n: Fields{
		// 			NewField(fId, value.New(value.TypeText, "value1").AsMultiple()),
		// 			NewField(fId2, value.New(value.TypeNumber, 42).AsMultiple()),
		// 			NewField(fId3, value.New(value.TypeText, "new field").AsMultiple()),
		// 		},
		// 		o: Fields{
		// 			NewField(fId, value.New(value.TypeText, "old value").AsMultiple()),
		// 			NewField(fId2, value.New(value.TypeNumber, 42).AsMultiple()),
		// 			NewField(fId4, value.New(value.TypeText, "to be deleted").AsMultiple()),
		// 		},
		// 	},
		// 	want: FieldChanges{
		// 		{
		// 			ID:            fId,
		// 			Type:          FieldChangeTypeUpdate,
		// 			CurrentValue:  value.New(value.TypeText, "value1").AsMultiple(),
		// 			PreviousValue: value.New(value.TypeText, "old value").AsMultiple(),
		// 		},
		// 		{
		// 			ID:            fId3,
		// 			Type:          FieldChangeTypeAdd,
		// 			CurrentValue:  value.New(value.TypeText, "new field").AsMultiple(),
		// 			PreviousValue: nil,
		// 		},
		// 		{
		// 			ID:            fId4,
		// 			Type:          FieldChangeTypeDelete,
		// 			CurrentValue:  nil,
		// 			PreviousValue: value.New(value.TypeText, "to be deleted").AsMultiple(),
		// 		},
		// 	},
		// },
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res := CompareFields(tt.args.n, tt.args.o)
			assert.Equal(t, tt.want, res)
		})
	}
}
