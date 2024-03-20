package sdkapiv2

import (
	"context"
	"encoding/json"
	"testing"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/samber/lo"
)

func TestCMS(t *testing.T) {
	const base = ""
	const token = ""
	const project = ""
	const cityid = ""

	if base == "" || token == "" || project == "" {
		t.SkipNow()
		return
	}

	ctx := context.Background()
	cms := lo.Must(cms.New(base, token))
	c := &CMS{
		Project:              project,
		IntegrationAPIClient: cms,
	}

	res := lo.Must(c.Files(ctx, modelKey, cityid))
	t.Log(string(lo.Must(json.MarshalIndent(res, "", "  "))))
}
