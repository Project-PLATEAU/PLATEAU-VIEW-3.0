package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type command = func(ctx context.Context, dbURL, dbName string, wetRun bool) error

var commands = map[string]command{
	"ref-field-schema": RefFieldSchema,
}

func main() {
	wet := flag.Bool("wet-run", false, "wet run (default: dry-run)")
	cmd := flag.String("cmd", "", "migration to be executed name")
	flag.Parse()

	if *cmd == "" {
		fmt.Print("command is not set")
		return
	}

	command := commands[*cmd]
	if command == nil {
		fmt.Printf("command '%s' not found", *cmd)
		return
	}

	// load .env
	if err := godotenv.Load(".env"); err != nil && !os.IsNotExist(err) {
		fmt.Printf("load .env failed: %s\n", err)
		return
	} else if err == nil {
		fmt.Printf("config: .env loaded\n")
	}

	// get db url
	dbURL := os.Getenv("REEARTH_CMS_DB")
	if dbURL == "" {
		fmt.Print("REEARTH_CMS_DB is not set")
		return
	}

	// exec command
	fmt.Printf("command: '%s' ", *cmd)
	ctx := context.Background()
	if err := command(ctx, dbURL, "reearth_cms", *wet); err != nil {
		fmt.Printf("faild: %s.\n", err)
		return
	}
	fmt.Printf("succeeded.\n")
}
