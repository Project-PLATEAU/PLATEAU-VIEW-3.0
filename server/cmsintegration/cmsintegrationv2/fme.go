package cmsintegrationv2

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/reearth/reearthx/log"
)

var ErrInvalidFMEID = errors.New("invalid fme id")

func signFMEID(payload, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(payload))
	sig := hex.EncodeToString(mac.Sum(nil))
	return fmt.Sprintf("%s:%s", sig, payload)
}

func unsignFMEID(id, secret string) (string, error) {
	_, payload, found := strings.Cut(id, ":")
	if !found {
		return "", ErrInvalidFMEID
	}

	if id != signFMEID(payload, secret) {
		return "", ErrInvalidFMEID
	}

	return payload, nil
}

type fmeInterface interface {
	Request(ctx context.Context, r fmeRequest) error
}

type fmeRequest interface {
	Query() url.Values
	Name() string
}

type fme struct {
	base      *url.URL
	token     string
	resultURL string
	client    *http.Client
}

func newFME(baseUrl, token, resultURL string) (*fme, error) {
	b, err := url.Parse(baseUrl)
	if err != nil {
		return nil, fmt.Errorf("invalid base url: %w", err)
	}

	return &fme{
		base:      b,
		token:     token,
		resultURL: resultURL,
		client:    http.DefaultClient,
	}, nil
}

func (s *fme) Request(ctx context.Context, r fmeRequest) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.url(r), nil)
	if err != nil {
		return fmt.Errorf("failed to init request: %w", err)
	}

	if s.token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("fmetoken token=%s", s.token))
	}

	log.Infofc(ctx, "fme: request: %s %s", req.Method, req.URL.String())

	res, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send: %w", err)
	}
	defer func() {
		_ = res.Body.Close()
	}()

	if res.StatusCode >= 300 {
		body, err := io.ReadAll(res.Body)
		if err != nil {
			return fmt.Errorf("failed to read body: %w", err)
		}

		return fmt.Errorf("failed to request: code=%d, body=%s", res.StatusCode, body)
	}

	return nil
}

func (s *fme) url(r fmeRequest) string {
	u := s.base.JoinPath("fmejobsubmitter", r.Name()+".fmw")
	q := r.Query()
	q.Set("opt_servicemode", "async")
	q.Set("resultUrl", s.resultURL)
	u.RawQuery = q.Encode()
	return u.String()
}

type ConversionRequest struct {
	ID     string
	Target string
	// JGD2011平面直角座標第1～19系のEPSGコード（6669〜6687）
	PRCS string
	// 政令指定都市を分割するかしないか
	DevideODC bool
	// 品質検査パラメータファイル
	QualityCheckParams string
	// 品質検査を行うか
	QualityCheck bool
}

func (r ConversionRequest) Query() url.Values {
	q := url.Values{}
	q.Set("id", r.ID)
	q.Set("target", r.Target)
	if r.PRCS != "" {
		q.Set("prcs", r.PRCS)
	}
	if !r.DevideODC {
		q.Set("divide_odc", "false")
	}
	if r.QualityCheckParams != "" {
		q.Set("config", r.QualityCheckParams)
	}
	return q
}

func (r ConversionRequest) Name() string {
	if r.QualityCheck {
		return "plateau2022-cms/quality-check-and-convert-all"
	}
	return "plateau2022-cms/convert-all"
	// only quality check: plateau2022-cms/quality-check
}
