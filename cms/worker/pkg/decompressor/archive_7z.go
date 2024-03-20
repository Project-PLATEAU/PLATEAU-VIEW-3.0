package decompressor

import (
	"io"
	"strings"

	"github.com/bodgit/sevenzip"
	"github.com/samber/lo"
)

type sevenZipFile struct {
	f *sevenzip.File
}

func (f sevenZipFile) Name() string {
	return f.f.Name
}

func (f sevenZipFile) Open() (io.ReadCloser, error) {
	return f.f.Open()
}

func (f sevenZipFile) Skip() bool {
	fn := f.Name()
	return strings.HasPrefix(fn, "/") || strings.HasSuffix(fn, "/")
}

func (f sevenZipFile) Size() uint64 {
	return f.f.UncompressedSize
}

type sevenZipArchive struct {
	sr *sevenzip.Reader
}

func new7ZipReader(r io.ReaderAt, size int64) (Archive, error) {
	reader, err := sevenzip.NewReader(r, size)
	if err != nil {
		return nil, err
	}
	return sevenZipArchive{
		sr: reader,
	}, nil
}

func (a sevenZipArchive) Files() []File {
	return lo.Map(a.sr.File, func(f *sevenzip.File, _ int) File {
		return sevenZipFile{f: f}
	})
}
