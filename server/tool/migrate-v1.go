package tool

import (
	"archive/zip"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strings"
)

func migrateV1(conf *Config, args []string) error {
	var listFilePath, output, baseURL, prefix string
	var offset int
	var wetrun bool

	flags := flag.NewFlagSet("migrate-v1", flag.ExitOnError)
	flags.StringVar(&listFilePath, "list", "", "list file path")
	flags.StringVar(&output, "output", "", "output file path")
	flags.StringVar(&baseURL, "base", "", "base URL")
	flags.StringVar(&prefix, "prefix", "", "base URL")
	flags.BoolVar(&wetrun, "wetrun", false, "wet run")
	flags.IntVar(&offset, "offset", 0, "offset")
	if err := flags.Parse(args); err != nil {
		return err
	}

	if baseURL == "" {
		return fmt.Errorf("base URL is required")
	}

	if output != "" {
		_ = os.MkdirAll(output, 0755)
	}

	listFile, err := os.ReadFile(listFilePath)
	if err != nil {
		return fmt.Errorf("failed to read list file: %w", err)
	}

	list, err := parseList(listFile, prefix)

	if offset > 0 {
		if len(list) < offset {
			return fmt.Errorf("offset is too large")
		}
		list = list[offset:]
	}

	le := len(list)
	if err != nil {
		return fmt.Errorf("failed to parse list: %w", err)
	}

	var file *os.File
	var zw *zip.Writer

	exhangeZw := func(g string) error {
		if zw != nil {
			if err := zw.Close(); err != nil {
				return fmt.Errorf("failed to close zip: %w", err)
			}
		}

		if file != nil {
			if err := file.Close(); err != nil {
				return fmt.Errorf("failed to close file: %w", err)
			}
		}

		if g == "" {
			zw = nil
			file = nil
			return nil
		}

		file, err = os.OpenFile(filepath.Join(output, "uc_pv1_"+g+".zip"), os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			return fmt.Errorf("failed to open file: %w", err)
		}

		zw = zip.NewWriter(file)
		return nil
	}

	defer func() {
		if zw != nil {
			_ = zw.Close()
		}
		if file != nil {
			_ = file.Close()
		}
	}()

	errors := []int{}
	group := ""
	for i, p := range list {
		g := p[1]
		filePath := path.Join(p[2:]...)

		path := filepath.Join(p...)
		u, err := url.JoinPath(baseURL, path)
		if err != nil {
			return fmt.Errorf("failed to join path: %w", err)
		}

		fmt.Printf("%d/%d | %s | %s | %s\n", i+1, le, g, filePath, u)

		if group != g {
			fmt.Printf("group: %s\n", g)

			if wetrun {
				if err := exhangeZw(g); err != nil {
					return err
				}
			}

			group = g
		}

		if wetrun {
			if err := downloadAndAddToZip(zw, path, u, filePath); err != nil {
				errors = append(errors, i)
				fmt.Printf("ERROR: %d/%d | %s | %s | %s\n", i+1, le, p[1], filePath, u)
			}
		}
	}

	if err := exhangeZw(""); err != nil {
		return err
	}

	if len(errors) > 0 {
		fmt.Printf("ERRORS: %d\n", len(errors))

		for _, i := range errors {
			p := list[i]
			filePath := path.Join(p[2:]...)
			path := filepath.Join(p...)
			u, _ := url.JoinPath(baseURL, path)

			fmt.Printf("ERROR: %d/%d | %s | %s | %s\n", i+1, le, p[1], filePath, u)
		}
	}

	return nil
}

func downloadAndAddToZip(zw *zip.Writer, path, url, filePath string) error {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to request: %w", err)
	}

	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to request: %s", res.Status)
	}

	f, err := zw.Create(filePath)
	if err != nil {
		return fmt.Errorf("failed to create zip entry: %w", err)
	}

	if _, err := io.Copy(f, res.Body); err != nil {
		return fmt.Errorf("failed to copy: %w", err)
	}

	return nil
}

func parseList(b []byte, prefix string) (res [][]string, err error) {
	start := 0
	for i, c := range b {
		if c == '\n' {
			r := string(b[start:i])
			start = i + 1

			if r == "" {
				continue
			}

			s := reSpace.Split(r, -1)
			if len(s) <= 3 {
				err = fmt.Errorf("invalid line at %d: %s", i, r)
				return
			}

			if prefix != "" && !strings.HasPrefix(s[3], prefix) {
				continue
			}

			t := strings.Split(s[3], "/")
			if strings.HasPrefix(t[len(t)-1], ".") {
				continue
			}

			if len(t) <= 2 {
				err = fmt.Errorf("invalid line at %d: %s", i, r)
				return
			}

			res = append(res, t)
		}
	}

	return
}

var reSpace = regexp.MustCompile(`\s+`)
