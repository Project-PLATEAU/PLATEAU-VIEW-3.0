package workspacesettings

type Builder struct {
	ws *WorkspaceSettings
}

func New() *Builder {
	return &Builder{ws: &WorkspaceSettings{}}
}

func (b *Builder) Build() (*WorkspaceSettings, error) {
	if b.ws.id.IsNil() {
		return nil, ErrInvalidID
	}

	return b.ws, nil
}

func (b *Builder) MustBuild() *WorkspaceSettings {
	ws, err := b.Build()
	if err != nil {
		panic(err)
	}
	return ws
}

func (b *Builder) ID(id ID) *Builder {
	b.ws.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.ws.id = NewID()
	return b
}

func (b *Builder) Tiles(wr *ResourceList) *Builder {
	b.ws.tiles = wr
	return b
}

func (b *Builder) Terrains(wr *ResourceList) *Builder {
	b.ws.terrains = wr
	return b
}
