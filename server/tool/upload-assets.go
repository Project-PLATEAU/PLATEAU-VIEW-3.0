package tool

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"os"
	"path"
	"path/filepath"

	cms "github.com/reearth/reearth-cms-api/go"
)

func uploadAssets(conf *Config, args []string) error {
	var base, token, pid, target string

	flags := flag.NewFlagSet("upload-assets", flag.ExitOnError)
	flags.StringVar(&base, "base", conf.CMS_BaseURL, "CMS base URL")
	flags.StringVar(&token, "token", conf.CMS_Token, "CMS token")
	flags.StringVar(&pid, "project", "", "project ID")
	flags.StringVar(&target, "target", "", "target dir path")

	if err := flags.Parse(args); err != nil {
		return err
	}

	if pid == "" {
		return errors.New("project ID is required")
	}

	c, err := cms.New(base, token)
	if err != nil {
		return err
	}

	files, err := os.ReadDir(target)
	if err != nil {
		return err
	}

	ctx := context.Background()
	for _, f := range files {
		if f.IsDir() {
			continue
		}

		ext := path.Ext(f.Name())
		if ext != ".zip" {
			continue
		}

		file, err := os.Open(filepath.Join(target, f.Name()))
		if err != nil {
			return fmt.Errorf("failed to open file: %w", err)
		}

		fmt.Printf("%s", file.Name())

		assetID, err := c.UploadAssetDirectly(ctx, pid, file.Name(), file)
		if err != nil {
			return fmt.Errorf("failed to upload asset: %w", err)
		}

		asset, err := c.Asset(ctx, assetID)
		if err != nil {
			return fmt.Errorf("failed to get asset: %w", err)
		}

		fmt.Printf(" -> %s | %s\n", assetID, asset.URL)
	}

	return nil
}
