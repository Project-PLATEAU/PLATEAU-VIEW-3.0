package govpolygon

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/util"
)

const dirpath = "govpolygondata"

var cahceDuration = 6 * time.Hour

type Handler struct {
	// e.g. "http://[::]:8080"
	gqlEndpoint       string
	processor         *Processor
	httpClient        *http.Client
	lock              sync.RWMutex
	geojson           []byte
	updateIfNotExists bool
	updatedAt         time.Time
}

func New(gqlEndpoint string, updateIfNotExists bool) *Handler {
	return &Handler{
		gqlEndpoint:       gqlEndpoint,
		processor:         NewProcessor(filepath.Join(dirpath, "japan_city.geojson")),
		httpClient:        http.DefaultClient,
		updateIfNotExists: updateIfNotExists,
	}
}

func (h *Handler) Route(g *echo.Group) *Handler {
	g.Use(middleware.CORS(), middleware.Gzip())
	g.GET("/plateaugovs.geojson", h.GetGeoJSON)
	// g.GET("/update", h.Update, errorLogger)
	return h
}

func (h *Handler) GetGeoJSON(c echo.Context) error {
	if h.updateIfNotExists && h.geojson == nil {
		if err := h.Update(c); err != nil {
			log.Errorfc(c.Request().Context(), "govpolygon: fail to init: %v", err)
		}
	}

	h.lock.RLock()
	defer h.lock.RUnlock()
	if h.geojson == nil {
		return c.JSON(http.StatusNotFound, "not found")
	}
	return c.JSONBlob(http.StatusOK, h.geojson)
}

func (h *Handler) Update(c echo.Context) error {
	if !h.updatedAt.IsZero() && util.Now().Sub(h.updatedAt) < cahceDuration {
		return nil
	}

	log.Infofc(c.Request().Context(), "govpolygon: updating")

	initial := h.geojson == nil
	if initial {
		h.lock.Lock()
		defer h.lock.Unlock()
		if h.geojson != nil {
			return nil
		}
	}

	ctx := c.Request().Context()
	q, err := h.getCityNames(ctx)
	if err != nil {
		return err
	}

	g, notfound, err := h.processor.ComputeGeoJSON(ctx, q)
	if err != nil {
		return err
	}
	if len(notfound) > 0 {
		log.Debugfc(context.Background(), "govpolygon: not found polygon: %v", notfound)
	}

	geojsonj, err := json.Marshal(g)
	if err != nil {
		return fmt.Errorf("failed to marshal geojson: %w", err)
	}

	if !initial {
		h.lock.Lock()
		defer h.lock.Unlock()
	}

	h.geojson = geojsonj
	h.updatedAt = util.Now()

	return nil
}

func (h *Handler) getCityNames(ctx context.Context) ([]string, error) {
	query := `
		{
			areas(input:{
				areaTypes: [CITY, WARD]
			}) {
				name
				code
				... on City {
					prefecture {
						name
					}
				}
				... on Ward {
					prefecture {
						name
					}
					city {
						name
					}
				}
			}
		}
	`

	requestBody, err := json.Marshal(map[string]string{
		"query": query,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, h.gqlEndpoint, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	resp, err := h.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}

	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var responseData struct {
		Data struct {
			Areas []struct {
				Name       string `json:"name"`
				Code       string `json:"code"`
				Prefecture struct {
					Name string `json:"name"`
				} `json:"prefecture"`
				City struct {
					Name string `json:"name"`
				} `json:"city"`
			} `json:"areas"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &responseData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response body: %w", err)
	}

	names := make([]string, len(responseData.Data.Areas))
	for i, area := range responseData.Data.Areas {
		if area.City.Name == "東京都23区" {
			area.City.Name = ""
		}

		if area.City.Name != "" {
			names[i] = area.Prefecture.Name + "/" + area.City.Name + "/" + area.Name
		} else if area.Prefecture.Name != area.Name {
			names[i] = area.Prefecture.Name + "/" + area.Name
		} else {
			names[i] = area.Name
		}
	}

	return names, nil
}