package preparegspatialjp

import (
	"archive/zip"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dustin/go-humanize"
	"github.com/reearth/reearthx/log"
)

func PrepareCityGML(ctx context.Context, c *CMSWrapper, m MergeContext) (res string, err error) {
	defer func() {
		if err == nil {
			return
		}
		err = fmt.Errorf("CityGMLのマージに失敗しました: %w", err)
		c.NotifyError(ctx, err, true, false, false)
	}()

	path, err := mergeCityGML(ctx, m)
	if err != nil {
		err = fmt.Errorf("failed to prepare citygml: %w", err)
		return
	}

	aid, err := c.UploadFile(ctx, path)
	if err != nil {
		err = fmt.Errorf("failed to upload file: %w", err)
		return
	}

	if err2 := c.UpdateDataItem(ctx, &GspatialjpDataItem{
		MergeCityGMLStatus: successTag,
		CityGML:            aid,
	}); err2 != nil {
		err = fmt.Errorf("failed to update data item: %w", err)
		return
	}

	res = path
	log.Infofc(ctx, "citygml prepared: %s", path)
	return
}

func mergeCityGML(ctx context.Context, c MergeContext) (string, error) {
	tmpDir := c.TmpDir
	cityItem := c.CityItem
	allFeatureItems := c.AllFeatureItems
	uc := c.UC

	// create a zip file
	rootName := fmt.Sprintf("%s_%s_city_%d_citygml_%d_op", cityItem.CityCode, cityItem.CityNameEn, cityItem.YearInt(), uc)

	zipFileName := rootName + ".zip"
	zipFilePath := filepath.Join(tmpDir, zipFileName)
	f, err := os.Create(zipFilePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}

	defer f.Close()
	zw := zip.NewWriter(f)
	cz := NewCityGMLZipWriter(zw, rootName)
	defer cz.Close()

	// copy files
	for _, ty := range citygmlFiles {
		url := getCityGMLURL(cityItem, ty)
		if url == "" {
			continue
		}

		log.Infofc(ctx, "preparing citygml (%s)...", ty)

		prefix := ""
		if ty == "misc" {
			ty = ""
			prefix = "misc/"
		}

		err := cz.DownloadAndWrite(ctx, url, tmpDir, ty, prefix, "")
		if err != nil {
			return "", fmt.Errorf("failed to download and write %s: %w", ty, err)
		}
	}

	// copy features
	for ty, a := range allFeatureItems {
		url := a.CityGML
		if a.CityGML == "" {
			continue
		}

		log.Infofc(ctx, "preparing citygml (%s)", ty)

		if err := cz.DownloadAndWrite(ctx, url, tmpDir, ty, "", "udx"); err != nil {
			return "", fmt.Errorf("failed to download and write citygml for %s: %w", ty, err)
		}
	}

	return zipFilePath, nil
}

func getCityGMLURL(item *CityItem, ty string) string {
	switch ty {
	case "codelists":
		return item.CodeLists
	case "schemas":
		return item.Schemas
	case "metadata":
		return item.Metadata
	case "specification":
		return item.Specification
	case "misc":
		return item.Misc
	}
	return ""
}

type CityGMLZipWriter struct {
	w    *Zip2zip
	name string
}

func NewCityGMLZipWriter(w *zip.Writer, name string) *CityGMLZipWriter {
	return &CityGMLZipWriter{
		w:    NewZip2zip(w),
		name: name,
	}
}

func (z *CityGMLZipWriter) Close() error {
	return z.w.Close()
}

func (z *CityGMLZipWriter) DownloadAndWrite(ctx context.Context, url, tempdir, ty, prefix, dir string) error {
	if url == "" {
		return nil
	}

	err := downloadAndConsumeZip(ctx, url, tempdir, func(zr *zip.Reader, fi os.FileInfo) error {
		log.Debugfc(ctx, "downloaded %s (%s)", url, humanize.Bytes(uint64(fi.Size())))
		reportDiskUsage(tempdir)

		return z.Write(ctx, zr, ty, prefix, dir)
	})

	if err != nil {
		return err
	}

	reportDiskUsage(tempdir)
	return nil
}

func (z *CityGMLZipWriter) Write(ctx context.Context, src *zip.Reader, ty, prefix, dir string) error {
	e := false
	fn := cityGMLZipPath(ty, prefix, dir)
	if err := z.w.Run(src, func(f *zip.File) (string, error) {
		p, err := fn(f.Name)
		if err != nil {
			return "", err
		}

		if p == "" {
			log.Debugfc(ctx, "zipping %s -> (skipped)", f.Name)
			return "", nil
		}

		log.Debugfc(ctx, "zipping %s -> %s", f.Name, p)
		e = true
		return p, nil
	}); err != nil {
		return err
	}

	if !e {
		return fmt.Errorf("no files found")
	}

	return nil
}

// ty: type of citygml file
// prefix: filter target zip files and trim prefix from path
// base: base directory added to new path
func cityGMLZipPath(ty, prefix, base string) func(string) (string, error) {
	return func(rawPath string) (string, error) {
		p := normalizeZipFilePath(rawPath)
		if p == "" {
			return "", nil
		}

		if prefix != "" {
			if strings.HasPrefix(p, prefix) {
				p = strings.TrimPrefix(p, prefix)
			} else if strings.HasSuffix(prefix, "/") && p == prefix {
				return "", nil
			}
		}

		if base == "" && ty == "" {
			return p, nil
		}

		paths := strings.Split(p, "/")
		if len(paths) == 0 {
			return "", nil
		}

		if ty != "" {
			if len(paths) > 1 && (paths[1] == ty || strings.HasSuffix(paths[1], "_"+ty)) {
				// */ty/** || */*_ty/** -> ty/**
				paths = paths[1:]
			}

			if strings.HasSuffix(paths[0], "_"+ty) {
				// *_ty/** -> ty/**
				paths[0] = ty
			}

			if paths[0] != ty {
				return "", fmt.Errorf("unexpected path: %s", rawPath)
			}
		}

		if base != "" {
			dirs := strings.Split(strings.TrimSuffix(base, "/"), "/")
			paths = append(dirs, paths...)
		}

		res := strings.Join(paths, "/")
		return res, nil
	}
}
