package preparegspatialjp

import (
	"archive/zip"
	"io"
	"path"
	"strings"
)

type Zip2zipFn = func(*zip.File) (string, error)

type Zip2zip struct {
	w *zip.Writer
	d map[string]struct{}
}

func NewZip2zip(w *zip.Writer) *Zip2zip {
	return &Zip2zip{
		w: w,
		d: map[string]struct{}{},
	}
}

func (z *Zip2zip) Close() error {
	return z.w.Close()
}

func (z *Zip2zip) Run(src *zip.Reader, fn Zip2zipFn) error {
	for _, f := range src.File {
		newpath, err := fn(f)
		if err != nil {
			return err
		}

		if newpath == "" {
			continue
		}

		isDir := f.FileInfo().IsDir()
		if isDir && !strings.HasSuffix(newpath, "/") {
			newpath += "/"
		}

		if err := z.zipMkdirp(newpath); err != nil {
			return err
		}

		if isDir {
			continue
		}

		if err := z.copyZipFile(f, newpath); err != nil {
			return err
		}
	}

	return nil
}

func (z *Zip2zip) copyZipFile(f *zip.File, p string) error {
	dst, err := z.w.Create(p)
	if err != nil {
		return err
	}

	src, err := f.Open()
	if err != nil {
		return err
	}

	defer func() {
		_ = src.Close()
	}()

	if _, err := io.Copy(dst, src); err != nil {
		return err
	}

	return nil
}

func (z *Zip2zip) zipMkdirp(p string) error {
	di := strings.Split(path.Dir(p), "/")

	for i := 0; i < len(di); i++ {
		if di[i] == "" || di[i] == "." {
			continue
		}

		dir := strings.Join(di[:i+1], "/")

		if _, ok := z.d[dir]; !ok {
			z.d[dir] = struct{}{}

			if _, err := z.w.Create(dir + "/"); err != nil {
				return err
			}
		}
	}

	return nil
}
