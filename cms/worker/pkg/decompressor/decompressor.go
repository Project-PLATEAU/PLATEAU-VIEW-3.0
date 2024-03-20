package decompressor

import (
	"context"
	"errors"
	"fmt"
	"io"

	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

var (
	ErrUnsupportedExtension = errors.New("unsupported extension type")
)

type WalkFunc func(name string) (io.WriteCloser, error)

type ProgressFunc func(context.Context, int64) error

type Decompressor struct {
	ar  Archive
	wFn WalkFunc
}

func New(r io.ReaderAt, size int64, ext string, wFn WalkFunc) (*Decompressor, error) {
	var a Archive
	switch ext {
	case "zip":
		var err error
		a, err = newZipReader(r, size)
		if err != nil {
			return nil, err
		}
	case "7z":
		var err error
		a, err = new7ZipReader(r, size)
		if err != nil {
			return nil, err
		}
	default:
		return nil, ErrUnsupportedExtension
	}
	return &Decompressor{
		ar:  a,
		wFn: wFn,
	}, nil
}

func (uz *Decompressor) Decompress(ctx context.Context, proceeded int64, progressFunc ProgressFunc) error {
	if uz == nil {
		return nil
	}
	archiveFiles := lo.Filter(uz.ar.Files(), func(f File, _ int) bool {
		return !f.Skip()
	})
	log.Infof("archive total entries=%d,proceeded=%d", len(archiveFiles), proceeded)
	return uz.read(ctx, archiveFiles, proceeded, progressFunc)
}

func (uz *Decompressor) read(ctx context.Context, zfs []File, proceeded int64, progressFunc ProgressFunc) error {
	buf := make([]byte, 16*1024*1024)
	for i := proceeded; i < int64(len(zfs)); i++ {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}
		f := zfs[i]
		fn := f.Name()
		log.Infof("extracting file Size=%5d File=%s", f.Size(), fn)
		x, err := f.Open()
		if err != nil {
			return fmt.Errorf("failed to open read file File=%s: %w", fn, err)
		}
		w, err := uz.wFn(fn)
		if err != nil {
			return fmt.Errorf("failed to invoke walk func File=%s: %w", fn, err)
		}
		if _, err := io.CopyBuffer(w, x, buf); err != nil {
			return fmt.Errorf("failed to copy file to Storage File=%s: %w", fn, err)
		}
		// NOTE: do not use deffer to close the reader, writer!
		if err := x.Close(); err != nil {
			return fmt.Errorf("failed to close read file File=%s: %w", fn, err)
		}
		if err := w.Close(); err != nil {
			return fmt.Errorf("failed to close write file File=%s: %w", fn, err)
		}
		if err := progressFunc(ctx, i+1); err != nil {
			return fmt.Errorf("progress: %w", err)
		}
	}
	return nil
}
