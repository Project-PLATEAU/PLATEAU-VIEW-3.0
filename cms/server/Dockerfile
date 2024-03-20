FROM golang:1.22.1-alpine AS build
ARG TAG=release
ARG REV
ARG VERSION

RUN apk add --update --no-cache git ca-certificates build-base mailcap

COPY go.mod go.sum main.go /app/
WORKDIR /app
RUN go mod download

COPY cmd/ /app/cmd/
COPY pkg/ /app/pkg/
COPY internal/ /app/internal/
COPY i18n/ /app/i18n/

RUN CGO_ENABLED=0 go build -tags "${TAG}" "-ldflags=-X main.version=${VERSION} -s -w -buildid=" -trimpath ./cmd/reearth-cms

FROM scratch

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /etc/mime.types /etc/mime.types
COPY --from=build /app/reearth-cms /app/reearth-cms
COPY web* /app/web/

WORKDIR /app

CMD [ "./reearth-cms" ]
