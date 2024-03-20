package datacatalog

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"net/http"

	"github.com/reearth/reearthx/rerror"
	"github.com/spkg/bom"
	"golang.org/x/sync/errgroup"
)

func fetchCSVs(ctx context.Context, urls, citygmlBaseURLs []string) (records [][]string, _ error) {
	if len(urls) != len(citygmlBaseURLs) {
		return nil, fmt.Errorf("length of urls and citygmlBaseURLs must be the same")
	}

	errg := errgroup.Group{}
	errg.SetLimit(10)

	for i, url := range urls {
		url := url
		base := citygmlBaseURLs[i]
		errg.Go(func() error {
			data, err := fetchCSV(ctx, url, base)
			if err != nil {
				return fmt.Errorf("failed to fetch %s: %w", url, err)
			}

			records = append(records, data...)
			return nil
		})
	}

	if err := errg.Wait(); err != nil {
		return nil, err
	}

	return records, nil
}

func fetchCSV(ctx context.Context, url, prefix string) (records [][]string, _ error) {
	res, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := http.DefaultClient.Do(res)
	if err != nil {
		return nil, fmt.Errorf("failed to request: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		if resp.StatusCode == http.StatusNotFound {
			return nil, rerror.ErrNotFound
		}
		return nil, fmt.Errorf("failed to request: %w", err)
	}

	c := csv.NewReader(bom.NewReader(resp.Body))
	for {
		record, err := c.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to read csv: %w", err)
		}

		record = append([]string{prefix}, record...)
		records = append(records, record)
	}

	return
}
