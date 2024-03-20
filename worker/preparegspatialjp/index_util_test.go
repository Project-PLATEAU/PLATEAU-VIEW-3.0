package preparegspatialjp

import (
	"archive/zip"
	"bytes"
	"io/fs"
	"testing"

	"github.com/spf13/afero"
	"github.com/spf13/afero/zipfs"
	"github.com/stretchr/testify/assert"
)

func TestWalk(t *testing.T) {
	buf := new(bytes.Buffer)
	zw := zip.NewWriter(buf)
	w, _ := zw.Create("aaa.txt")
	_, _ = w.Write([]byte("aaa"))
	_, _ = zw.Create("bbb/")
	_, _ = zw.Create("bbb/ccc/")
	w, _ = zw.Create("bbb/ccc/ddd.txt")
	_, _ = w.Write([]byte("ddd"))
	w, _ = zw.Create("ccc.txt")
	_, _ = w.Write([]byte("ccc"))
	zw.Close()

	bufr := bytes.NewReader(buf.Bytes())
	zr, _ := zip.NewReader(bufr, int64(buf.Len()))

	iofs := afero.NewIOFS(zipfs.New(zr))

	res, err := walk(iofs, "", "/", func(path string, info fs.DirEntry, err error) (*IndexItem, error) {
		return &IndexItem{
			Name: path,
		}, nil
	})

	expected := &IndexItem{
		Name: "",
		Children: []*IndexItem{
			{
				Name: "aaa.txt",
			},
			{
				Name: "bbb",
				Children: []*IndexItem{
					{
						Name: "bbb/ccc",
						Children: []*IndexItem{
							{
								Name: "bbb/ccc/ddd.txt",
							},
						},
					},
				},
			},
			{
				Name: "ccc.txt",
			},
		},
	}

	assert.NoError(t, err)
	assert.Equal(t, expected, res)

	res, err = walk(iofs, "", "/", func(path string, info fs.DirEntry, err error) (*IndexItem, error) {
		return nil, nil
	})
	assert.NoError(t, err)
	assert.Nil(t, res)

	exptected2 := &IndexItem{
		Name: "",
		Children: []*IndexItem{
			{
				Name: "aaa.txt",
			},
			{
				Name: "ccc.txt",
			},
		},
	}
	res, err = walk(iofs, "", "/", func(path string, info fs.DirEntry, err error) (*IndexItem, error) {
		if path == "bbb" {
			return nil, nil
		}
		return &IndexItem{
			Name: path,
		}, nil
	})
	assert.NoError(t, err)
	assert.Equal(t, exptected2, res)
}
