package datacatalogv3

import (
	"context"
	"encoding/csv"
	"os"
	"testing"

	"github.com/joho/godotenv"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/stretchr/testify/assert"
)

func TestExtractDataFromCMS(t *testing.T) {
	run := false

	if !run {
		t.Skip("skip")
	}

	_ = godotenv.Load("../../.env")
	cmsurl := os.Getenv("REEARTH_PLATEAUVIEW_CMS_BASEURL")
	cmstoken := os.Getenv("REEARTH_PLATEAUVIEW_CMS_TOKEN")
	prj := os.Getenv("REEARTH_PLATEAUVIEW_TEST_CMS_PROJECT")
	if cmsurl == "" || cmstoken == "" || prj == "" {
		t.Skip("cms url or cms token or project is empty")
	}

	ctx := context.Background()
	c, err := cms.New(cmsurl, cmstoken)
	assert.NoError(t, err)

	c2 := NewCMS(c, 2023)
	all, err := c2.GetAll(ctx, prj)
	assert.NoError(t, err)

	t.Log("get all data done")

	// do something with all
	records := [][]string{}

	for _, city := range all.City {
		g := all.FindGspatialjpDataItemByCityID(city.ID)
		if g == nil {
			continue
		}

		if !g.HasIndex {
			continue
		}

		r := []string{city.ID, city.CityName, city.CityCode}
		records = append(records, r)
	}

	f, err := os.Create("cities.csv")
	assert.NoError(t, err)
	w := csv.NewWriter(f)
	_ = w.WriteAll(records)
	w.Flush()
	_ = f.Close()
}
