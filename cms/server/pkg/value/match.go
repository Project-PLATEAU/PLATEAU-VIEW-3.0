package value

type Match struct {
	Asset     func(Asset)
	Bool      func(Bool)
	Checkbox  func(Bool)
	DateTime  func(DateTime)
	Integer   func(Integer)
	Number    func(Number)
	String    func(String)
	Text      func(String)
	TextArea  func(String)
	RichText  func(String)
	Markdown  func(String)
	Select    func(String)
	Tag       func(String)
	Reference func(Reference)
	URL       func(URL)
	Group     func(Group)
	Default   func()
}

func (v *Value) Match(m Match) {
	if v == nil {
		if m.Default != nil {
			m.Default()
		}
		return
	}
	switch v.t {
	case TypeText:
		if m.Text != nil {
			m.Text(v.v.(String))
			return
		}
	case TypeTextArea:
		if m.TextArea != nil {
			m.TextArea(v.v.(String))
			return
		}
	case TypeRichText:
		if m.RichText != nil {
			m.RichText(v.v.(String))
			return
		}
	case TypeMarkdown:
		if m.Markdown != nil {
			m.Markdown(v.v.(String))
			return
		}
	case TypeDateTime:
		if m.DateTime != nil {
			m.DateTime(v.v.(DateTime))
			return
		}
	case TypeAsset:
		if m.Asset != nil {
			m.Asset(v.v.(Asset))
			return
		}
	case TypeBool:
		if m.Bool != nil {
			m.Bool(v.v.(Bool))
			return
		}
	case TypeCheckbox:
		if m.Checkbox != nil {
			m.Checkbox(v.v.(Bool))
			return
		}
	case TypeSelect:
		if m.Select != nil {
			m.Select(v.v.(String))
			return
		}
	case TypeTag:
		if m.Tag != nil {
			m.Tag(v.v.(String))
			return
		}
	case TypeNumber:
		if m.Number != nil {
			m.Number(v.v.(Number))
			return
		}
	case TypeInteger:
		if m.Integer != nil {
			m.Integer(v.v.(Integer))
			return
		}
	case TypeReference:
		if m.Reference != nil {
			m.Reference(v.v.(Reference))
			return
		}
	case TypeURL:
		if m.URL != nil {
			m.URL(v.v.(URL))
			return
		}
	case TypeGroup:
		if m.Group != nil {
			m.Group(v.v.(Group))
			return
		}
	}

	if m.Default != nil {
		m.Default()
	}
}

type OptionalMatch struct {
	Match
	None func()
}

func (ov *Optional) Match(m OptionalMatch) {
	if ov == nil || ov.v == nil {
		if m.None != nil {
			m.None()
		} else if m.Default != nil {
			m.Default()
		}
		return
	}
	ov.v.Match(m.Match)
}
