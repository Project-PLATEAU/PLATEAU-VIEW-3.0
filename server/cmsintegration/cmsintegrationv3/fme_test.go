package cmsintegrationv3

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/stretchr/testify/assert"
)

var _ fmeInterface = (*fme)(nil)

func TestFME(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	ctx := context.Background()
	req := fmeRequest{
		ID:        "xxx",
		Type:      fmeTypeQcConv,
		Target:    "target",
		ResultURL: "https://example.com",
	}

	// valid
	calls := mockFMEServer(t, "http://fme.example.com", req)
	f := newFME("http://fme.example.com", "https://example.com")
	assert.NoError(t, f.Request(ctx, req))
	assert.Equal(t, 1, calls())
}

func mockFMEServer(t *testing.T, url string, expected fmeRequest) func() int {
	t.Helper()

	responder := func(req *http.Request) (*http.Response, error) {
		r := fmeRequest{}
		if err := json.NewDecoder(req.Body).Decode(&r); err != nil {
			return nil, err
		}

		if !reflect.DeepEqual(expected, r) {
			return nil, fmt.Errorf("request body is not equal: %v != %v", expected, r)
		}

		return httpmock.NewJsonResponse(200, "ok")
	}

	httpmock.RegisterResponder("POST", url, responder)

	return func() int {
		return httpmock.GetCallCountInfo()[fmt.Sprintf("POST %s", url)]
	}
}

func TestSignFMEID(t *testing.T) {
	payload := "xxxxxxxxx"
	signed := signFMEID(payload, "aaa")
	unsigned, err := unsignFMEID(signed, "aaa")
	assert.NoError(t, err)
	assert.Equal(t, payload, unsigned)

	unsigned2, err := unsignFMEID(signed, "aaa2")
	assert.Empty(t, unsigned2)
	assert.Same(t, ErrInvalidFMEID, err)
}

type fmeMock struct {
	called []fmeRequest
	err    error
}

func (f *fmeMock) Request(ctx context.Context, r fmeRequest) error {
	f.called = append(f.called, r)
	d, err := json.Marshal(r)
	if err != nil {
		return err
	}
	fmt.Printf("fmeMock: %s\n", string(d))
	return f.err
}

func (f *fmeMock) Called() []fmeRequest {
	return f.called
}
