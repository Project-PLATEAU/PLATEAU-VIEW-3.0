FROM golang:1.21-alpine AS build
ARG TAG=release
ARG VERSION

RUN apk add --update --no-cache git ca-certificates build-base fuse
RUN CGO_ENABLED=0 go install github.com/googlecloudplatform/gcsfuse@v1.4.1

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . /app/

RUN CGO_ENABLED=0 go build -tags "${TAG}" "-ldflags=-X main.version=${VERSION} -s -w -buildid=" -trimpath

FROM scratch

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /go/bin/gcsfuse /usr/bin/
COPY --from=build /app/worker /app/plateauview-worker

WORKDIR /app

ENTRYPOINT [ "/app/plateauview-worker" ]
