package preparegspatialjp

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestCommand(t *testing.T) {
	_ = godotenv.Load("../.env")

	conf := Config{
		CMSURL:     os.Getenv("REEARTH_CMS_URL"),
		CMSToken:   os.Getenv("REEARTH_CMS_TOKEN"),
		ProjectID:  "",
		CityItemID: "",
	}

	if conf.ProjectID == "" || conf.CityItemID == "" {
		t.Skip("ProjectID or CityItemID is empty")
	}

	if err := Command(&conf); err != nil {
		t.Fatal(err)
	}
}
