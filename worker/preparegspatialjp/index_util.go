package preparegspatialjp

import (
	"archive/zip"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"strings"

	"github.com/spf13/afero"
	"github.com/spf13/afero/zipfs"
)

type walker func(path string, d fs.DirEntry, err error) (*IndexItem, error)

func walk(f fs.FS, path, pathsep string, fn walker) (*IndexItem, error) {
	if f == nil || fn == nil {
		return nil, nil
	}
	if pathsep == "" {
		pathsep = string(os.PathSeparator)
	}

	items := []*IndexItem{}
	lastDepth := 0
	prevNilPath := ""
	err := fs.WalkDir(f, path, func(path string, d fs.DirEntry, err error) error {
		if strings.HasPrefix(path, prevNilPath+"/") {
			return fs.SkipDir
		}

		prevNilPath = ""
		item, err := fn(path, d, err)
		if path == "" {
			items = append(items, item)
			return err
		}
		if err != nil && (err != fs.SkipDir || err != fs.SkipAll) {
			return err
		}
		if item == nil {
			prevNilPath = path
			return err
		}

		depth := strings.Count(path, pathsep) + 1

		if depth < lastDepth {
			diff := lastDepth - depth
			items = items[:len(items)-diff-1]
			lastDepth -= diff + 1
		}

		lastItem := items[len(items)-1]
		if depth == lastDepth {
			items[len(items)-1] = item
			lastItem = items[len(items)-2]
		} else if depth == lastDepth+1 {
			items = append(items, item)
		} else if depth != lastDepth {
			return nil // skip
		}

		lastItem.Children = append(lastItem.Children, item)
		lastDepth = depth
		return err
	})

	if err != nil {
		return nil, fmt.Errorf("failed to walk directory: %w", err)
	}
	if len(items) == 0 {
		return nil, nil
	}
	return items[0], nil
}

func openZip(path string) (fs.FS, func() error, error) {
	if path == "" {
		return nil, nil, nil
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, nil, err
	}

	closer := func() error {
		return file.Close()
	}

	stat, err := file.Stat()
	if err != nil {
		return nil, nil, err
	}

	z, err := zip.NewReader(file, stat.Size())
	if err != nil {
		return nil, nil, err
	}

	f := zipfs.New(z)
	return afero.NewIOFS(f), closer, nil
}

func fileSize(path string) (uint64, error) {
	if path == "" {
		return uint64(0), nil
	}
	stat, err := os.Stat(path)
	if err != nil {
		return 0, err
	}
	return uint64(stat.Size()), nil
}

func httpSize(url string) (uint64, error) {
	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}

	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("http status code: %d", resp.StatusCode)
	}

	if resp.ContentLength > 0 {
		return uint64(resp.ContentLength), nil
	}

	size, err := io.Copy(io.Discard, resp.Body)
	if err != nil {
		return 0, err
	}

	return uint64(size), nil
}

func fileNameFromURL(url string) string {
	if url == "" {
		return ""
	}
	parts := strings.Split(url, "/")
	return parts[len(parts)-1]
}
