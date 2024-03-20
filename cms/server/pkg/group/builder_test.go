package group

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestNew(t *testing.T) {
	tests := []struct {
		name string
		want *Builder
	}{
		{
			name: "test",
			want: &Builder{
				group: &Group{},
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, New())
		})
	}
}

func TestBuilder_Build(t *testing.T) {
	mId := NewID()
	pId := id.NewProjectID()
	sId := id.NewSchemaID()
	type fields struct {
		m *Group
		k key.Key
	}
	tests := []struct {
		name    string
		fields  fields
		want    *Group
		wantErr error
	}{
		{
			name: "pass",
			fields: fields{
				m: &Group{
					id:          mId,
					project:     pId,
					schema:      sId,
					name:        "m1",
					description: "m1 desc",
					key:         key.New("T123456"),
				},
				k: key.New("T123456"),
			},
			want: &Group{
				id:          mId,
				project:     pId,
				schema:      sId,
				name:        "m1",
				description: "m1 desc",
				key:         key.New("T123456"),
			},
			wantErr: nil,
		},
		{
			name: "pass with out updated at",
			fields: fields{
				m: &Group{
					id:          mId,
					project:     pId,
					schema:      sId,
					name:        "m1",
					description: "m1 desc",
					key:         key.New("T123456"),
				},
				k: key.New("T123456"),
			},
			want: &Group{
				id:          mId,
				project:     pId,
				schema:      sId,
				name:        "m1",
				description: "m1 desc",
				key:         key.New("T123456"),
			},
			wantErr: nil,
		},
		{
			name: "fail 1",
			fields: fields{
				m: &Group{
					project:     pId,
					schema:      sId,
					name:        "m1",
					description: "m1 desc",
					key:         key.New("T123456"),
				},
				k: key.New("T123456"),
			},
			want:    nil,
			wantErr: ErrInvalidID,
		},
		{
			name: "fail 2",
			fields: fields{
				m: &Group{
					id:          mId,
					project:     pId,
					name:        "m1",
					description: "m1 desc",
					key:         key.New("T123456"),
				},
				k: key.New("T123456"),
			},
			want:    nil,
			wantErr: ErrInvalidID,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			b := &Builder{
				group: tt.fields.m,
			}
			got, err := b.Build()
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	mId := NewID()
	pId := id.NewProjectID()
	sId := id.NewSchemaID()
	type fields struct {
		m *Group
		k key.Key
	}
	tests := []struct {
		name    string
		fields  fields
		want    *Group
		wantErr error
	}{
		{
			name: "pass",
			fields: fields{
				m: &Group{
					id:          mId,
					project:     pId,
					schema:      sId,
					name:        "m1",
					description: "m1 desc",
					key:         key.New("T123456"),
				},
				k: key.New("T123456"),
			},
			want: &Group{
				id:          mId,
				project:     pId,
				schema:      sId,
				name:        "m1",
				description: "m1 desc",
				key:         key.New("T123456"),
			},
			wantErr: nil,
		},
		{
			name: "pass with out updated at",
			fields: fields{
				m: &Group{
					id:          mId,
					project:     pId,
					schema:      sId,
					name:        "m1",
					description: "m1 desc",
					key:         key.New("T123456"),
				},
				k: key.New("T123456"),
			},
			want: &Group{
				id:          mId,
				project:     pId,
				schema:      sId,
				name:        "m1",
				description: "m1 desc",
				key:         key.New("T123456"),
			},
			wantErr: nil,
		},
		{
			name: "fail 1",
			fields: fields{
				m: &Group{
					// id:          nil,
					project:     pId,
					schema:      sId,
					name:        "m1",
					description: "m1 desc",
					key:         key.New("T123456"),
				},
				k: key.New("T123456"),
			},
			want:    nil,
			wantErr: ErrInvalidID,
		},
		{
			name: "fail 2",
			fields: fields{
				m: &Group{
					id:          mId,
					project:     pId,
					name:        "m1",
					description: "m1 desc",
					key:         key.New("T123456"),
				},
				k: key.New("T123456"),
			},
			want:    nil,
			wantErr: ErrInvalidID,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			b := &Builder{
				group: tt.fields.m,
			}

			if tt.wantErr != nil {
				assert.PanicsWithError(t, tt.wantErr.Error(), func() {
					b.MustBuild()
				})
				return
			}
			assert.Equal(t, tt.want, b.MustBuild())
		})
	}
}

func TestBuilder_Description(t *testing.T) {
	b := New()
	b.Description("foo")
	assert.Equal(t, "foo", b.group.Description())
}

func TestBuilder_ID(t *testing.T) {
	b := New()
	gid := id.NewGroupID()
	b.ID(gid)
	assert.Equal(t, gid, b.group.ID())
}

func TestBuilder_Key(t *testing.T) {
	b := New()
	k := key.New("xabczz")
	b.Key(k)
	assert.Equal(t, k, b.group.Key())
}

func TestBuilder_Name(t *testing.T) {
	b := New()
	b.Name("xxx")
	assert.Equal(t, "xxx", b.group.Name())
}

func TestBuilder_NewID(t *testing.T) {
	b := New()
	b.NewID()
	assert.False(t, b.group.id.IsEmpty())
}

func TestBuilder_Project(t *testing.T) {
	b := New()
	pid := id.NewProjectID()
	b.Project(pid)
	assert.Equal(t, pid, b.group.Project())
}

func TestBuilder_Schema(t *testing.T) {
	b := New()
	sid := id.NewSchemaID()
	b.Schema(sid)
	assert.Equal(t, sid, b.group.Schema())
}
