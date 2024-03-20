package datacatalogv2

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"sort"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFetcher(t *testing.T) {
	// snapshot-like test
	base, _ := os.LookupEnv("REEARTH_PLATEAUVIEW_TEST_BASE")
	project, _ := os.LookupEnv("REEARTH_PLATEAUVIEW_TEST_PROJECT_PLATEAU")
	currentAPI, _ := os.LookupEnv("REEARTH_PLATEAUVIEW_TEST_DATACATALOG_API")
	// currentAPI := ""
	save := false
	// save := true

	if base == "" || project == "" {
		t.Skip("no base and project")
	}

	// save the current implementation result
	f := lo.Must(NewFetcher(base))
	cmsres := lo.Must(f.Do(context.Background(), project, FetcherDoOptions{}))

	res := cmsres.All()
	if save {
		lo.Must0(os.WriteFile("datacatalog.json", lo.Must(json.MarshalIndent(res, "", "  ")), 0644))
	}

	if currentAPI != "" {
		// save the current result
		res2 := lo.Must(http.Get(currentAPI))
		defer res2.Body.Close()
		var r []DataCatalogItem
		lo.Must0(json.NewDecoder(res2.Body).Decode(&r))
		if save {
			lo.Must0(os.WriteFile("datacatalog-current.json", lo.Must(json.MarshalIndent(r, "", "  ")), 0644))
		}

		// extract and sort ID list from res
		var ids []string
		for _, v := range res {
			ids = append(ids, v.ID)
		}
		sort.Strings(ids)

		// extract and sort ID list from r
		var currentIDs []string
		for _, v := range r {
			currentIDs = append(currentIDs, v.ID)
		}
		sort.Strings(currentIDs)

		// compare IDs
		t.Logf("items: current %d items <-> now %d items", len(currentIDs), len(ids))
		assert.Equal(t, currentIDs, ids)
	}
}

func TestFetcher_Do(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/plateau", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]any{"id": "x"}},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/dataset", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]any{"id": "z"}},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/usecase", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]any{"id": "y"}},
		"totalCount": 1,
	})))

	ctx := context.Background()
	r, err := lo.Must(NewFetcher("https://example.com")).Do(ctx, "ppp", FetcherDoOptions{})
	assert.Equal(t, ResponseAll{
		Plateau: []PlateauItem{{ID: "x"}},
		Dataset: []DatasetItem{{ID: "z"}},
		Usecase: []UsecaseItem{{ID: "y"}},
	}, r)
	assert.NoError(t, err)
}

func TestFetcher_Do2(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/plateau", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusNotFound, map[string]any{
		"error": "not found",
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/dataset", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]any{"id": "z"}},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/usecase", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusNotFound, map[string]any{
		"error": "not found",
	})))

	ctx := context.Background()
	r, err := lo.Must(NewFetcher("https://example.com")).Do(ctx, "ppp", FetcherDoOptions{})
	assert.Equal(t, ResponseAll{
		Dataset: []DatasetItem{{ID: "z"}},
	}, r)
	assert.NoError(t, err)
}

func TestFetcher_Do3(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/plateau", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusNotFound, map[string]any{
		"error": "not found",
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/dataset", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusNotFound, map[string]any{
		"error": "not found",
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/usecase", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusNotFound, map[string]any{
		"error": "not found",
	})))

	ctx := context.Background()
	r, err := lo.Must(NewFetcher("https://example.com")).Do(ctx, "ppp", FetcherDoOptions{})
	assert.Equal(t, rerror.ErrNotFound, err)
	assert.Empty(t, r)
}

func TestFetcher_Do4(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()

	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/plateau", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]any{"id": "x"}},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/dataset", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]any{"id": "z"}},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/ppp/usecase", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]any{"id": "y"}},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/subprj/plateau", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results": []any{
			map[string]any{"id": "a", "city_name": "xxx市"},
			map[string]any{"id": "b", "city_name": "yyy市"},
		},
		"totalCount": 1,
	})))
	httpmock.RegisterResponderWithQuery("GET", "https://example.com/api/p/subprj/dataset", "page=1&per_page=100", lo.Must(httpmock.NewJsonResponder(http.StatusOK, map[string]any{
		"results":    []any{map[string]any{"id": "c", "city_name": "xxx市"}},
		"totalCount": 1,
	})))

	ctx := context.Background()
	r, err := lo.Must(NewFetcher("https://example.com")).Do(ctx, "ppp", FetcherDoOptions{
		Subproject: "subprj",
		CityName:   "xxx市",
	})
	assert.Equal(t, ResponseAll{
		Plateau: []PlateauItem{{ID: "x"}, {ID: "a", CityName: "xxx市"}},
		Dataset: []DatasetItem{{ID: "z"}, {ID: "c", CityName: "xxx市"}},
		Usecase: []UsecaseItem{{ID: "y"}},
	}, r)
	assert.NoError(t, err)
}
