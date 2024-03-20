package schema

import "github.com/reearth/reearthx/account/accountdomain"

type Builder struct {
	s *Schema
}

func New() *Builder {
	return &Builder{s: &Schema{}}
}

func (b *Builder) Build() (*Schema, error) {
	if b.s.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.s.workspace.IsNil() {
		return nil, ErrInvalidID
	}
	if b.s.project.IsNil() {
		return nil, ErrInvalidID
	}
	if b.s.titleField != nil && !b.s.HasField(*b.s.titleField) {
		return nil, ErrInvalidTitleField
	}
	if b.s.titleField != nil && (len(b.s.fields) == 0 || b.s.fields == nil) {
		return nil, ErrInvalidTitleField
	}
	return b.s, nil
}

func (b *Builder) MustBuild() *Schema {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id ID) *Builder {
	b.s.id = id.Clone()
	return b
}

func (b *Builder) NewID() *Builder {
	b.s.id = NewID()
	return b
}

func (b *Builder) Workspace(workspace accountdomain.WorkspaceID) *Builder {
	b.s.workspace = workspace.Clone()
	return b
}

func (b *Builder) Project(project ProjectID) *Builder {
	b.s.project = project.Clone()
	return b
}

func (b *Builder) Fields(fields FieldList) *Builder {
	b.s.fields = fields.Clone()
	return b
}

func (b *Builder) TitleField(fid *FieldID) *Builder {
	b.s.titleField = fid.CloneRef()
	return b
}
