package interactor

import (
	"context"
	"io"
	"os"
	"path"
	"testing"

	wfs "github.com/reearth/reearth-cms/worker/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/worker/pkg/asset"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUsecase_Decompress(t *testing.T) {
	fs := mockFs()
	mCMS := NewCMS()
	fileGateway, err := wfs.NewFile(fs, "")
	require.NoError(t, err)

	uc := NewUsecase(gateway.NewGateway(fileGateway, mCMS), nil)

	assert.NoError(t, uc.Decompress(context.Background(), "aaa", "test.zip"))

	f := lo.Must(os.Open("testdata/test1.txt"))
	content := lo.Must(io.ReadAll(f))
	_ = f.Close()
	assert.Equal(t, "hello1", string(content))

	f = lo.Must(os.Open("testdata/test2.txt"))
	content = lo.Must(io.ReadAll(f))
	_ = f.Close()
	assert.Equal(t, "hello2", string(content))

	// unsupported extension doesn't return error
	assert.NoError(t, uc.Decompress(context.Background(), "aaa", "test.tar.gz"))
}

func mockFs() afero.Fs {
	fs := afero.NewMemMapFs()
	zf := lo.Must(os.Open("testdata/test.zip"))

	zf2 := lo.Must(fs.Create("test.zip"))
	_ = lo.Must(io.Copy(zf2, zf))
	_ = zf2.Close()

	zf3 := lo.Must(fs.Create("test.tar.gz"))
	_ = lo.Must(io.Copy(zf3, zf))
	_ = zf3.Close()

	_ = zf.Close()

	return fs
}

type mockCMS struct {
}

func NewCMS() gateway.CMS {
	return &mockCMS{}
}

func (c *mockCMS) NotifyAssetDecompressed(_ context.Context, _ string, _ *asset.ArchiveExtractionStatus) error {
	return nil
}

func Test_smartJoinPath(t *testing.T) {
	tests := []struct {
		name       string
		firstPath  string
		secondPath string
		want       string
	}{
		{
			name:       "join and remove duplicates",
			firstPath:  path.Join("a", "b"),
			secondPath: path.Join("b", "c"),
			want:       path.Join("a", "b", "c"),
		},
		{
			name:       "join",
			firstPath:  path.Join("a", "b"),
			secondPath: path.Join("c", "d"),
			want:       path.Join("a", "b", "c", "d"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, smartJoinPath(tt.firstPath, tt.secondPath))
		})
	}
}
