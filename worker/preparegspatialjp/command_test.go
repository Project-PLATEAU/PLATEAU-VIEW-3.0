package preparegspatialjp

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestCommand(t *testing.T) {
	_ = godotenv.Load("../.env")

	conf := Config{
		CMSURL:      os.Getenv("REEARTH_CMS_URL"),
		CMSToken:    os.Getenv("REEARTH_CMS_TOKEN"),
		ProjectID:   os.Getenv("REEARTH_CMS_PROJECT"),
		CityItemID:  "",
		SkipCityGML: true,
		SkipPlateau: true,
		SkipMaxLOD:  true,
		SkipRelated: true,
		SkipIndex:   false,
		WetRun:      false,
		Clean:       true,
	}

	if conf.CMSURL == "" || conf.CMSToken == "" || conf.ProjectID == "" || conf.CityItemID == "" {
		t.Skip("CMS URL, CMS Token, ProjectID, or CityItemID is empty")
	}

	if err := Command(&conf); err != nil {
		t.Fatal(err)
	}
}
