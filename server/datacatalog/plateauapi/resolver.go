//go:generate go run github.com/99designs/gqlgen generate --config gqlgen.yml

package plateauapi

import (
	"errors"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
)

// Example

// func main() {
// 	port := os.Getenv("PORT")
// 	if port == "" {
// 		port = "8080"
// 	}

// 	srv := plateauapi.NewSchema()

// 	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
// 	http.Handle("/query", srv)

// 	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
// 	log.Fatal(http.ListenAndServe(":"+port, nil))
// }

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var ErrDatacatalogUnavailable = errors.New("datacatalog is currently unavailable")

type Repo interface {
	QueryResolver
	Name() string
}

type Resolver struct {
	Repo Repo
}

type Option func(*handler.Server)

func NewService(repo Repo, opts ...Option) *handler.Server {
	srv := handler.NewDefaultServer(NewSchema(repo))
	for _, opt := range opts {
		opt(srv)
	}
	return srv
}

func NewSchema(repo Repo) graphql.ExecutableSchema {
	return NewExecutableSchema(Config{Resolvers: &Resolver{Repo: repo}})
}

func FixedComplexityLimit(limit int) Option {
	return func(s *handler.Server) {
		if limit > 0 {
			s.Use(extension.FixedComplexityLimit(limit))
		}
	}
}
