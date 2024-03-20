package decompressor

import (
	"io"
)

type File interface {
	Name() string
	Open() (io.ReadCloser, error)
	Skip() bool
	Size() uint64
}

type Archive interface {
	Files() []File
}
