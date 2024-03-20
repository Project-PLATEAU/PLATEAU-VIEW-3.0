package preparegspatialjp

import (
	"archive/zip"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/reearth/reearthx/log"
)

func downloadAndConsumeZip(ctx context.Context, url, dir string, fn func(*zip.Reader, os.FileInfo) error) error {
	return downloadAndConsumeFile(ctx, url, dir, func(f *os.File, fi os.FileInfo) error {
		zr, err := zip.NewReader(f, fi.Size())
		if err != nil {
			return err
		}
		return fn(zr, fi)
	})
}

func downloadAndConsumeFile(ctx context.Context, url, dir string, fn func(f *os.File, fi os.FileInfo) error) error {
	p, err := downloadFileTo(ctx, url, dir)
	if err != nil {
		return err
	}

	return consumeFile(p, fn)
}

func downloadFileTo(ctx context.Context, url, dir string) (string, error) {
	r, err := downloadFile(ctx, url)
	if err != nil {
		return "", err
	}
	defer func() {
		_ = r.Close()
	}()

	name := fileNameFromURL(url)
	dest := filepath.Join(dir, name)
	_ = os.MkdirAll(dir, os.ModePerm)
	f, err := os.Create(dest)
	if err != nil {
		return "", err
	}

	defer func() {
		_ = f.Close()
	}()

	_, err = io.Copy(f, r)
	if err != nil {
		return "", err
	}
	return dest, nil
}

func downloadFile(ctx context.Context, url string) (io.ReadCloser, error) {
	log.Infofc(ctx, "downloading %s...", url)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to download %s: %s", url, resp.Status)
	}

	return resp.Body, nil
}

func consumeFile(p string, fn func(f *os.File, fi os.FileInfo) error) (err error) {
	s, err2 := os.Stat(p)
	if err2 != nil {
		err = err2
		return
	}

	f, err2 := os.Open(p)
	if err2 != nil {
		err = err2
		return
	}

	defer func() {
		_ = f.Close()
		if err == nil {
			_ = os.Remove(p)
		}
	}()

	err = fn(f, s)
	return
}

func normalizeZipFilePath(p string) string {
	p = strings.ReplaceAll(p, `\`, "/")
	if strings.HasPrefix(p, "__MACOSX/") ||
		strings.HasSuffix(p, "/.DS_Store") ||
		strings.HasSuffix(p, "/Thumbs.db") ||
		p == ".DS_Store" || p == "Thumbs.db" {
		return ""
	}
	return p
}
