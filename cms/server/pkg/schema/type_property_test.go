package schema

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestTypeProperty_Type(t *testing.T) {
	assert.Equal(t, value.TypeText, (&TypeProperty{t: value.TypeText}).Type())
}

func TestMatchTypeProperty(t *testing.T) {
	val := ""
	m := TypePropertyMatch{
		Text:      func(_ *FieldText) { val = "Text" },
		TextArea:  func(_ *FieldTextArea) { val = "TextArea" },
		RichText:  func(_ *FieldRichText) { val = "RichText" },
		Markdown:  func(_ *FieldMarkdown) { val = "Markdown" },
		Asset:     func(_ *FieldAsset) { val = "Asset" },
		DateTime:  func(_ *FieldDateTime) { val = "DateTime" },
		Bool:      func(_ *FieldBool) { val = "Bool" },
		Select:    func(_ *FieldSelect) { val = "Select" },
		Tag:       func(_ *FieldTag) { val = "Tag" },
		Integer:   func(_ *FieldInteger) { val = "Integer" },
		Number:    func(_ *FieldNumber) { val = "Number" },
		Reference: func(_ *FieldReference) { val = "Reference" },
		URL:       func(_ *FieldURL) { val = "URL" },
		Default:   func() { val = "Default" },
	}

	type args struct {
		tp *TypeProperty
		m  TypePropertyMatch
	}

	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "nil",
			args: args{
				tp: nil,
				m:  m,
			},
			want: "Default",
		},
		{
			name: "text",
			args: args{
				tp: &TypeProperty{t: value.TypeText, text: &FieldText{}},
				m:  m,
			},
			want: "Text",
		},
		{
			name: "textArea",
			args: args{
				tp: &TypeProperty{t: value.TypeTextArea, textArea: &FieldTextArea{}},
				m:  m,
			},
			want: "TextArea",
		},
		{
			name: "RichText",
			args: args{
				tp: &TypeProperty{t: value.TypeRichText, richText: &FieldRichText{}},
				m:  m,
			},
			want: "RichText",
		},
		{
			name: "Markdown",
			args: args{
				tp: &TypeProperty{t: value.TypeMarkdown, markdown: &FieldMarkdown{}},
				m:  m,
			},
			want: "Markdown",
		},
		{
			name: "Asset",
			args: args{
				tp: &TypeProperty{t: value.TypeAsset, asset: &FieldAsset{}},
				m:  m,
			},
			want: "Asset",
		},
		{
			name: "DateTime",
			args: args{
				tp: &TypeProperty{t: value.TypeDateTime, dateTime: &FieldDateTime{}},
				m:  m,
			},
			want: "DateTime",
		},
		{
			name: "Bool",
			args: args{
				tp: &TypeProperty{t: value.TypeBool, bool: &FieldBool{}},
				m:  m,
			},
			want: "Bool",
		},
		{
			name: "Select",
			args: args{
				tp: &TypeProperty{t: value.TypeSelect, selectt: &FieldSelect{}},
				m:  m,
			},
			want: "Select",
		},
		{
			name: "Tag",
			args: args{
				tp: &TypeProperty{t: value.TypeTag, tag: &FieldTag{}},
				m:  m,
			},
			want: "Tag",
		},
		{
			name: "Number",
			args: args{
				tp: &TypeProperty{t: value.TypeNumber, number: &FieldNumber{}},
				m:  m,
			},
			want: "Number",
		},
		{
			name: "Integer",
			args: args{
				tp: &TypeProperty{t: value.TypeInteger, integer: &FieldInteger{}},
				m:  m,
			},
			want: "Integer",
		},
		{
			name: "Reference",
			args: args{
				tp: &TypeProperty{t: value.TypeReference, reference: &FieldReference{}},
				m:  m,
			},
			want: "Reference",
		},
		{
			name: "URL",
			args: args{
				tp: &TypeProperty{t: value.TypeURL, url: &FieldURL{}},
				m:  m,
			},
			want: "URL",
		},
		{
			name: "Default",
			args: args{
				tp: &TypeProperty{t: value.TypeAsset, asset: &FieldAsset{}},
				m: TypePropertyMatch{
					Default: func() { val = "Default" },
				},
			},
			want: "Default",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			// t.Parallel() must not use parallel
			tc.args.tp.Match(tc.args.m)
			assert.Equal(t, tc.want, val)
		})
	}
}

func TestMatchTypeProperty1(t *testing.T) {
	m := TypePropertyMatch1[string]{
		Text:      func(_ *FieldText) string { return "Text" },
		TextArea:  func(_ *FieldTextArea) string { return "TextArea" },
		RichText:  func(_ *FieldRichText) string { return "RichText" },
		Markdown:  func(_ *FieldMarkdown) string { return "Markdown" },
		Asset:     func(_ *FieldAsset) string { return "Asset" },
		DateTime:  func(_ *FieldDateTime) string { return "DateTime" },
		Bool:      func(_ *FieldBool) string { return "Bool" },
		Select:    func(_ *FieldSelect) string { return "Select" },
		Tag:       func(_ *FieldTag) string { return "Tag" },
		Integer:   func(_ *FieldInteger) string { return "Integer" },
		Number:    func(_ *FieldNumber) string { return "Number" },
		Reference: func(_ *FieldReference) string { return "Reference" },
		URL:       func(_ *FieldURL) string { return "URL" },
		Default:   func() string { return "Default" },
	}

	type args struct {
		tp *TypeProperty
		m  TypePropertyMatch1[string]
	}

	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "nil",
			args: args{
				tp: nil,
				m:  m,
			},
			want: "Default",
		},
		{
			name: "text",
			args: args{
				tp: &TypeProperty{t: value.TypeText, text: &FieldText{}},
				m:  m,
			},
			want: "Text",
		},
		{
			name: "textArea",
			args: args{
				tp: &TypeProperty{t: value.TypeTextArea, textArea: &FieldTextArea{}},
				m:  m,
			},
			want: "TextArea",
		},
		{
			name: "RichText",
			args: args{
				tp: &TypeProperty{t: value.TypeRichText, richText: &FieldRichText{}},
				m:  m,
			},
			want: "RichText",
		},
		{
			name: "Markdown",
			args: args{
				tp: &TypeProperty{t: value.TypeMarkdown, markdown: &FieldMarkdown{}},
				m:  m,
			},
			want: "Markdown",
		},
		{
			name: "Asset",
			args: args{
				tp: &TypeProperty{t: value.TypeAsset, asset: &FieldAsset{}},
				m:  m,
			},
			want: "Asset",
		},
		{
			name: "DateTime",
			args: args{
				tp: &TypeProperty{t: value.TypeDateTime, dateTime: &FieldDateTime{}},
				m:  m,
			},
			want: "DateTime",
		},
		{
			name: "Bool",
			args: args{
				tp: &TypeProperty{t: value.TypeBool, bool: &FieldBool{}},
				m:  m,
			},
			want: "Bool",
		},
		{
			name: "Select",
			args: args{
				tp: &TypeProperty{t: value.TypeSelect, selectt: &FieldSelect{}},
				m:  m,
			},
			want: "Select",
		},
		{
			name: "Tag",
			args: args{
				tp: &TypeProperty{t: value.TypeTag, tag: &FieldTag{}},
				m:  m,
			},
			want: "Tag",
		},
		{
			name: "Number",
			args: args{
				tp: &TypeProperty{t: value.TypeNumber, number: &FieldNumber{}},
				m:  m,
			},
			want: "Number",
		},
		{
			name: "Integer",
			args: args{
				tp: &TypeProperty{t: value.TypeInteger, integer: &FieldInteger{}},
				m:  m,
			},
			want: "Integer",
		},
		{
			name: "Reference",
			args: args{
				tp: &TypeProperty{t: value.TypeReference, reference: &FieldReference{}},
				m:  m,
			},
			want: "Reference",
		},
		{
			name: "URL",
			args: args{
				tp: &TypeProperty{t: value.TypeURL, url: &FieldURL{}},
				m:  m,
			},
			want: "URL",
		},
		{
			name: "Default",
			args: args{
				tp: &TypeProperty{t: value.TypeAsset, asset: &FieldAsset{}},
				m: TypePropertyMatch1[string]{
					Default: func() string { return "Default" },
				},
			},
			want: "Default",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, MatchTypeProperty1(tc.args.tp, tc.args.m))
		})
	}
}

func TestTypeProperty_Validate(t *testing.T) {
	tag := NewTag("xyz", TagColorVolcano)
	tf, _ := NewFieldTag(TagList{tag})
	type args struct {
		tp    *TypeProperty
		value *value.Value
	}

	tests := []struct {
		name string
		args args
		want error
	}{
		{
			name: "nil",
			args: args{
				tp:    nil,
				value: nil,
			},
			want: nil,
		},
		{
			name: "text",
			args: args{
				tp:    &TypeProperty{t: value.TypeText, text: NewText(nil)},
				value: value.TypeText.Value("xyz"),
			},
			want: nil,
		},
		{
			name: "textArea",
			args: args{
				tp:    &TypeProperty{t: value.TypeTextArea, textArea: NewTextArea(nil)},
				value: value.TypeTextArea.Value("xyz"),
			},
			want: nil,
		},
		{
			name: "RichText",
			args: args{
				tp:    &TypeProperty{t: value.TypeRichText, richText: NewRichText(nil)},
				value: value.TypeRichText.Value("xyz"),
			},
			want: nil,
		},
		{
			name: "Markdown",
			args: args{
				tp:    &TypeProperty{t: value.TypeMarkdown, markdown: NewMarkdown(nil)},
				value: value.TypeMarkdown.Value("xyz"),
			},
			want: nil,
		},
		{
			name: "Asset",
			args: args{
				tp:    &TypeProperty{t: value.TypeAsset, asset: NewAsset()},
				value: value.TypeAsset.Value(id.NewAssetID()),
			},
			want: nil,
		},
		{
			name: "DateTime",
			args: args{
				tp:    &TypeProperty{t: value.TypeDateTime, dateTime: NewDateTime()},
				value: value.TypeDateTime.Value(time.Now()),
			},
			want: nil,
		},
		{
			name: "Bool",
			args: args{
				tp:    &TypeProperty{t: value.TypeBool, bool: NewBool()},
				value: value.TypeBool.Value(true),
			},
			want: nil,
		},
		{
			name: "Select",
			args: args{
				tp:    &TypeProperty{t: value.TypeSelect, selectt: NewSelect([]string{"xyz"})},
				value: value.TypeSelect.Value("xyz"),
			},
			want: nil,
		},
		{
			name: "Tag",
			args: args{
				tp:    &TypeProperty{t: value.TypeTag, tag: tf},
				value: value.TypeTag.Value(tag.ID()),
			},
			want: nil,
		},
		{
			name: "Number",
			args: args{
				tp:    &TypeProperty{t: value.TypeNumber, number: lo.Must1(NewNumber(nil, nil))},
				value: value.TypeNumber.Value("1"),
			},
			want: nil,
		},
		{
			name: "Integer",
			args: args{
				tp:    &TypeProperty{t: value.TypeInteger, integer: lo.Must1(NewInteger(nil, nil))},
				value: value.TypeInteger.Value("1"),
			},
			want: nil,
		},
		{
			name: "Reference",
			args: args{
				tp:    &TypeProperty{t: value.TypeReference, reference: NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil)},
				value: value.TypeReference.Value(id.NewItemID()),
			},
			want: nil,
		},
		{
			name: "URL",
			args: args{
				tp:    &TypeProperty{t: value.TypeURL, url: NewURL()},
				value: value.TypeURL.Value("https://test.hugo"),
			},
			want: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.args.tp.Validate(tc.args.value))
		})
	}
}
