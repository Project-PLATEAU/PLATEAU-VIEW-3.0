package asset

import (
	"path"
	"strings"

	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type File struct {
	name        string
	size        uint64
	contentType string
	path        string
	children    []*File
}

func (f *File) Name() string {
	if f == nil {
		return ""
	}
	return f.name
}

func (f *File) SetName(n string) {
	f.name = n
}

func (f *File) Size() uint64 {
	if f == nil {
		return 0
	}
	return f.size
}

func (f *File) ContentType() string {
	if f == nil {
		return ""
	}
	return f.contentType
}

func (f *File) Path() string {
	if f == nil {
		return ""
	}
	return f.path
}

func (f *File) Children() []*File {
	if f == nil {
		return nil
	}
	return slices.Clone(f.children)
}

func (f *File) IsDir() bool {
	return f != nil && f.children != nil
}

func (f *File) AppendChild(c *File) {
	if f == nil {
		return
	}
	f.children = append(f.children, c)
}

func (f *File) Clone() *File {
	if f == nil {
		return nil
	}

	var children []*File
	if f.children != nil {
		children = lo.Map(f.children, func(f *File, _ int) *File { return f.Clone() })
	}

	return &File{
		name:        f.name,
		size:        f.size,
		contentType: f.contentType,
		path:        f.path,
		children:    children,
	}
}

func (f *File) Files() (res []*File) {
	if f == nil {
		return nil
	}
	if len(f.children) > 0 {
		for _, c := range f.children {
			res = append(res, c.Files()...)
		}
	} else {
		res = append(res, f)
	}
	return
}

func (f *File) RootPath(uuid string) string {
	if f == nil {
		return ""
	}
	return path.Join(uuid[:2], uuid[2:], f.path)
}

// FoldFiles organizes files into directories and returns the files as children of the parent directory.
// The parent directory refers to a zip file located in the root directory and is treated as the root directory.
func FoldFiles(files []*File, parent *File) *File {
	files = slices.Clone(files)
	slices.SortFunc(files, func(a, b *File) int {
		return strings.Compare(a.Path(), b.Path())
	})

	folded := *parent
	folded.children = nil

	const rootDir = "/"
	dirs := map[string]*File{
		rootDir: &folded,
	}
	for i := range files {
		parentDir := rootDir
		names := strings.TrimPrefix(files[i].Path(), "/")
		for {
			name, rest, found := strings.Cut(names, "/")
			if !found {
				break
			}
			names = rest

			dir := path.Join(parentDir, name)
			if _, ok := dirs[dir]; !ok {
				d := &File{
					name: name,
					path: dir,
				}
				dirs[parentDir].AppendChild(d)
				dirs[dir] = d
			}
			parentDir = dir
		}
		dirs[parentDir].AppendChild(files[i])
	}
	return &folded
}
