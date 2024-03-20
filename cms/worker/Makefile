lint:
	golangci-lint run --fix

test:
	go test -race -v ./...

build:
	go build ./cmd/reearth-cms-worker

run-app:
	go run ./cmd/reearth-cms-worker

.PHONY: lint test build run-app
