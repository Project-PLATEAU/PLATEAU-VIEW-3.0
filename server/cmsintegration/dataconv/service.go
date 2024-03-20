package dataconv

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strings"

	geojson "github.com/paulmach/go.geojson"
	"github.com/pkg/errors"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
	"github.com/spkg/bom"
)

var ErrSkip = errors.New("skip")

type Item struct {
	ID         string   `json:"id" cms:"id"`
	Type       string   `json:"type" cms:"type"`
	DataFormat string   `json:"data_format" cms:"data_format,select"`
	Data       string   `json:"data" cms:"data,asset"`
	DataConv   string   `json:"data_conv" cms:"data_conv,select"`
	DataOrig   []string `json:"data_orig" cms:"data_orig,asset"`
}

func (i Item) Fields() []*cms.Field {
	i2 := &cms.Item{}
	cms.Marshal(i, i2)
	return i2.Fields
}

type Service struct {
	cms  cms.Interface
	conf Config
}

func NewService(conf Config) (*Service, error) {
	if conf.Disable {
		return nil, nil
	}

	if conf.CMSModel == "" {
		conf.CMSModel = defaultCMSModel
	}

	c, err := cms.New(conf.CMSBase, conf.CMSToken)
	if err != nil {
		return nil, err
	}

	return &Service{
		cms:  c,
		conf: conf,
	}, nil
}

func (s *Service) model() string {
	return s.conf.CMSModel
}

func (s *Service) CMS() cms.Interface {
	return s.cms
}

func (s *Service) Convert(ctx context.Context, i Item, pid string) error {
	landmark := strings.Contains(i.Type, "ランドマーク") || strings.Contains(i.Type, "鉄道駅")
	border := strings.Contains(i.Type, "行政界")
	if i.DataConv == "変換しない" || i.Data == "" || (!landmark && !border) {
		return errors.Wrapf(ErrSkip, "invalid item: %#v", i)
	}

	a, err := s.cms.Asset(ctx, i.Data)
	if err != nil || a.URL == "" {
		return fmt.Errorf("failed to load asset: %s", i.Data)
	}

	u, err := url.Parse(a.URL)
	if b := fileName(u.Path); err != nil ||
		path.Ext(u.Path) != ".geojson" ||
		border && !strings.HasSuffix(b, "_border") ||
		landmark && !strings.HasSuffix(b, "_landmark") && !strings.HasSuffix(b, "_station") {
		return errors.Wrapf(ErrSkip, "invalid URL or ext is not geojson:  %s", u)
	}

	g, err := getGeoJSON(ctx, a.URL)
	if err != nil || g == nil {
		return fmt.Errorf("failed to load geojson: %w", err)
	}

	id := strings.TrimSuffix(path.Base(u.Path), path.Ext(u.Path))
	var res any
	if landmark {
		res, err = ConvertLandmark(g, id)
	} else {
		res, err = ConvertBorder(g, id)
	}
	if err != nil {
		return fmt.Errorf("failed to convert %s: %v", id, err)
	}

	b, err := json.Marshal(res)
	if err != nil {
		return fmt.Errorf("failed to marshal result (%s): %w", id, err)
	}

	aid, err := s.cms.UploadAssetDirectly(ctx, pid, id+".czml", bytes.NewReader(b))
	if err != nil {
		return fmt.Errorf("failed to upload asset (%s): %w", id, err)
	}

	if _, err := s.cms.UpdateItem(ctx, i.ID, Item{
		Data:       aid,
		DataFormat: "CZML",
		DataOrig:   []string{i.Data},
	}.Fields(), nil); err != nil {
		return fmt.Errorf("failed to upload item (%s): %w", id, err)
	}

	return nil
}

func getGeoJSON(ctx context.Context, u string) (*geojson.FeatureCollection, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
	if err != nil {
		log.Errorfc(ctx, "dataconv: failed to create a request: %v", err)
		return nil, nil
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Errorfc(ctx, "dataconv: failed to get asset: %v", err)
		return nil, nil
	}

	defer func() {
		_ = res.Body.Close()
	}()

	if res.StatusCode != http.StatusOK {
		log.Errorfc(ctx, "dataconv: failed to get asset: status code is %d", res.StatusCode)
		return nil, nil
	}

	f := geojson.FeatureCollection{}
	if err := json.NewDecoder(bom.NewReader(res.Body)).Decode(&f); err != nil {
		log.Errorfc(ctx, "dataconv: invalid geojson: %v", err)
	}

	return &f, nil
}

func fileName(p string) string {
	return strings.TrimSuffix(path.Base(p), path.Ext(p))
}
