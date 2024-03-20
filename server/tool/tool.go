package tool

import (
	"errors"
	"fmt"
	"os"
)

type Config struct {
	CMS_BaseURL string
	CMS_Token   string
}

func Main(conf *Config, args []string) {
	subommand := args[0]
	var err error

	switch subommand {
	case "setup-city-items":
		err = setupCityItems(conf, args[1:])
	case "migrate-v1":
		err = migrateV1(conf, args[1:])
	case "upload-assets":
		err = uploadAssets(conf, args[1:])
	case "help":
		err = help(conf)
	default:
		err = errors.New("invalid subcommand")
	}

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func help(*Config) error {
	fmt.Println(`Usage: plateauview <command> [arguments] [options] [flags]`)
	return nil
}
