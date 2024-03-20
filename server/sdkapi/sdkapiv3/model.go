package sdkapiv3

import (
	"github.com/hasura/go-graphql-client"
)

type DatasetsQuery struct {
	Areas []QueryArea `graphql:"areas(input: {areaTypes: PREFECTURE})"`
}

type QueryArea struct {
	ID         graphql.String
	Name       graphql.String
	Code       graphql.String
	Prefecture QueryPrefecture `graphql:"... on Prefecture"`
}

type QueryPrefecture struct {
	Cities []QueryCity
}

type QueryCity struct {
	ID       graphql.String
	Name     graphql.String
	Code     graphql.String
	Datasets []QueryDataset `graphql:"datasets(input: {includeTypes: [\"bldg\"]})"`
	Citygml  *QueryCityCityGML
}

type QueryDataset struct {
	ID          graphql.String
	Name        graphql.String
	TypeCode    graphql.String
	Description graphql.String
}

type QueryCityCityGML struct {
	FeatureTypes     []graphql.String
	PlateauSpecMinor QueryPlateauSpecMinor
}

type QueryPlateauSpecMinor struct {
	Version graphql.String
}
