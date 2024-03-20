package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var ErrInvalidValue = rerror.NewE(i18n.T("invalid value"))

// TypeProperty Represent special attributes for some field
// only one of the type properties should be not nil
type TypeProperty struct {
	t         value.Type
	asset     *FieldAsset
	text      *FieldText
	textArea  *FieldTextArea
	richText  *FieldRichText
	markdown  *FieldMarkdown
	dateTime  *FieldDateTime
	bool      *FieldBool
	checkbox  *FieldCheckbox
	selectt   *FieldSelect
	tag       *FieldTag
	integer   *FieldInteger
	number    *FieldNumber
	reference *FieldReference
	url       *FieldURL
	group     *FieldGroup
}

type TypePropertyMatch struct {
	Text      func(*FieldText)
	TextArea  func(*FieldTextArea)
	RichText  func(text *FieldRichText)
	Markdown  func(*FieldMarkdown)
	Asset     func(*FieldAsset)
	DateTime  func(*FieldDateTime)
	Bool      func(*FieldBool)
	Checkbox  func(checkbox *FieldCheckbox)
	Select    func(*FieldSelect)
	Tag       func(*FieldTag)
	Integer   func(*FieldInteger)
	Number    func(*FieldNumber)
	Reference func(*FieldReference)
	URL       func(*FieldURL)
	Group     func(*FieldGroup)
	Default   func()
}

type TypePropertyMatch1[T any] struct {
	Text      func(*FieldText) T
	TextArea  func(*FieldTextArea) T
	RichText  func(text *FieldRichText) T
	Markdown  func(*FieldMarkdown) T
	Asset     func(*FieldAsset) T
	DateTime  func(*FieldDateTime) T
	Bool      func(*FieldBool) T
	Checkbox  func(checkbox *FieldCheckbox) T
	Select    func(*FieldSelect) T
	Tag       func(*FieldTag) T
	Integer   func(*FieldInteger) T
	Number    func(*FieldNumber) T
	Reference func(*FieldReference) T
	URL       func(*FieldURL) T
	Group     func(*FieldGroup) T
	Default   func() T
}

func (t *TypeProperty) Type() value.Type {
	return t.t
}

func (t *TypeProperty) Validate(v *value.Value) error {
	return MatchTypeProperty1(t, TypePropertyMatch1[error]{
		Text: func(f *FieldText) error {
			return f.Validate(v)
		},
		TextArea: func(f *FieldTextArea) error {
			return f.Validate(v)
		},
		RichText: func(f *FieldRichText) error {
			return f.Validate(v)
		},
		Markdown: func(f *FieldMarkdown) error {
			return f.Validate(v)
		},
		Asset: func(f *FieldAsset) error {
			return f.Validate(v)
		},
		Bool: func(f *FieldBool) error {
			return f.Validate(v)
		},
		Checkbox: func(f *FieldCheckbox) error {
			return f.Validate(v)
		},
		DateTime: func(f *FieldDateTime) error {
			return f.Validate(v)
		},
		Number: func(f *FieldNumber) error {
			return f.Validate(v)
		},
		Integer: func(f *FieldInteger) error {
			return f.Validate(v)
		},
		Reference: func(f *FieldReference) error {
			return f.Validate(v)
		},
		Select: func(f *FieldSelect) error {
			return f.Validate(v)
		},
		Tag: func(f *FieldTag) error {
			return f.Validate(v)
		},
		URL: func(f *FieldURL) error {
			return f.Validate(v)
		},
		Group: func(f *FieldGroup) error {
			return f.Validate(v)
		},
	})
}

func (t *TypeProperty) ValidateMultiple(v *value.Multiple) error {
	return MatchTypeProperty1(t, TypePropertyMatch1[error]{
		Text: func(f *FieldText) error {
			return f.ValidateMultiple(v)
		},
		TextArea: func(f *FieldTextArea) error {
			return f.ValidateMultiple(v)
		},
		RichText: func(f *FieldRichText) error {
			return f.ValidateMultiple(v)
		},
		Markdown: func(f *FieldMarkdown) error {
			return f.ValidateMultiple(v)
		},
		Asset: func(f *FieldAsset) error {
			return f.ValidateMultiple(v)
		},
		Bool: func(f *FieldBool) error {
			return f.ValidateMultiple(v)
		},
		DateTime: func(f *FieldDateTime) error {
			return f.ValidateMultiple(v)
		},
		Number: func(f *FieldNumber) error {
			return f.ValidateMultiple(v)
		},
		Integer: func(f *FieldInteger) error {
			return f.ValidateMultiple(v)
		},
		Reference: func(f *FieldReference) error {
			return f.ValidateMultiple(v)
		},
		Select: func(f *FieldSelect) error {
			return f.ValidateMultiple(v)
		},
		Tag: func(f *FieldTag) error {
			return f.ValidateMultiple(v)
		},
		URL: func(f *FieldURL) error {
			return f.ValidateMultiple(v)
		},
		Group: func(f *FieldGroup) error {
			return f.ValidateMultiple(v)
		},
	})
}

func (t *TypeProperty) Match(m TypePropertyMatch) {
	if t == nil || t.t == value.TypeUnknown {
		if m.Default != nil {
			m.Default()
		}
		return
	}

	switch t.t {
	case value.TypeText:
		if m.Text != nil {
			m.Text(t.text)
			return
		}
	case value.TypeTextArea:
		if m.TextArea != nil {
			m.TextArea(t.textArea)
			return
		}
	case value.TypeRichText:
		if m.RichText != nil {
			m.RichText(t.richText)
			return
		}
	case value.TypeMarkdown:
		if m.Markdown != nil {
			m.Markdown(t.markdown)
			return
		}
	case value.TypeAsset:
		if m.Asset != nil {
			m.Asset(t.asset)
			return
		}
	case value.TypeDateTime:
		if m.DateTime != nil {
			m.DateTime(t.dateTime)
			return
		}
	case value.TypeReference:
		if m.Reference != nil {
			m.Reference(t.reference)
			return
		}
	case value.TypeGroup:
		if m.Group != nil {
			m.Group(t.group)
			return
		}
	case value.TypeNumber:
		if m.Number != nil {
			m.Number(t.number)
			return
		}
	case value.TypeInteger:
		if m.Integer != nil {
			m.Integer(t.integer)
			return
		}
	case value.TypeSelect:
		if m.Select != nil {
			m.Select(t.selectt)
			return
		}
	case value.TypeTag:
		if m.Tag != nil {
			m.Tag(t.tag)
			return
		}
	case value.TypeBool:
		if m.Bool != nil {
			m.Bool(t.bool)
			return
		}
	case value.TypeCheckbox:
		if m.Checkbox != nil {
			m.Checkbox(t.checkbox)
			return
		}
	case value.TypeURL:
		if m.URL != nil {
			m.URL(t.url)
			return
		}
	}

	if m.Default != nil {
		m.Default()
	}
}

func (t *TypeProperty) Clone() *TypeProperty {
	if t == nil {
		return nil
	}

	return &TypeProperty{
		t:         t.t,
		text:      t.text.Clone(),
		textArea:  t.textArea.Clone(),
		richText:  t.richText.Clone(),
		markdown:  t.markdown.Clone(),
		asset:     t.asset.Clone(),
		dateTime:  t.dateTime.Clone(),
		bool:      t.bool.Clone(),
		checkbox:  t.checkbox.Clone(),
		selectt:   t.selectt.Clone(),
		number:    t.number.Clone(),
		tag:       t.tag.Clone(),
		integer:   t.integer.Clone(),
		reference: t.reference.Clone(),
		group:     t.group.Clone(),
		url:       t.url.Clone(),
	}
}

func MatchTypeProperty1[T any](t *TypeProperty, m TypePropertyMatch1[T]) (res T) {
	if t == nil || t.t == value.TypeUnknown {
		if m.Default != nil {
			return m.Default()
		}
		return
	}

	switch t.t {
	case value.TypeText:
		if m.Text != nil {
			return m.Text(t.text)
		}
	case value.TypeTextArea:
		if m.TextArea != nil {
			return m.TextArea(t.textArea)
		}
	case value.TypeRichText:
		if m.RichText != nil {
			return m.RichText(t.richText)
		}
	case value.TypeMarkdown:
		if m.Markdown != nil {
			return m.Markdown(t.markdown)
		}
	case value.TypeAsset:
		if m.Asset != nil {
			return m.Asset(t.asset)
		}
	case value.TypeDateTime:
		if m.DateTime != nil {
			return m.DateTime(t.dateTime)
		}
	case value.TypeReference:
		if m.Reference != nil {
			return m.Reference(t.reference)
		}
	case value.TypeNumber:
		if m.Number != nil {
			return m.Number(t.number)
		}
	case value.TypeInteger:
		if m.Integer != nil {
			return m.Integer(t.integer)
		}
	case value.TypeSelect:
		if m.Select != nil {
			return m.Select(t.selectt)
		}
	case value.TypeTag:
		if m.Tag != nil {
			return m.Tag(t.tag)
		}
	case value.TypeBool:
		if m.Bool != nil {
			return m.Bool(t.bool)
		}
	case value.TypeCheckbox:
		if m.Checkbox != nil {
			return m.Checkbox(t.checkbox)
		}
	case value.TypeURL:
		if m.URL != nil {
			return m.URL(t.url)
		}
	case value.TypeGroup:
		if m.Group != nil {
			return m.Group(t.group)
		}
	}

	if m.Default != nil {
		return m.Default()
	}
	return
}
