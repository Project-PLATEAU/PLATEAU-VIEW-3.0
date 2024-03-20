package aws

import "io"

type writeCloser struct {
	io.Writer
}

func (wc *writeCloser) Close() error {
	if closer, ok := wc.Writer.(io.Closer); ok {
		return closer.Close()
	}
	return nil
}
