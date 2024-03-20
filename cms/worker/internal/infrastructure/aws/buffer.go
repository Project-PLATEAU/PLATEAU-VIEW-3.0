package aws

import "bytes"

type buffer struct {
	b bytes.Reader
}

func (b *buffer) Close() error {
	return nil
}

func (b *buffer) ReadAt(buf []byte, offset int64) (int, error) {
	return b.b.ReadAt(buf, offset)
}
