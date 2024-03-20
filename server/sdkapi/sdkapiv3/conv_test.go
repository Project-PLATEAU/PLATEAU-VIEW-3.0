package sdkapiv3

import (
	"testing"

	"github.com/hasura/go-graphql-client"
	"github.com/stretchr/testify/assert"
)

func TestQueryToDatasets(t *testing.T) {
	query := &DatasetsQuery{
		Areas: []QueryArea{
			{
				Name: "Prefecture 1",
				Prefecture: QueryPrefecture{
					Cities: []QueryCity{
						{
							Name: "City 1",
							Code: "City1",
							Citygml: &QueryCityCityGML{
								FeatureTypes: []graphql.String{"bldg"},
								PlateauSpecMinor: QueryPlateauSpecMinor{
									Version: "3.4",
								},
							},
							Datasets: []QueryDataset{
								{
									TypeCode:    "bldg",
									Description: "Description",
								},
								{
									TypeCode: "DatasetType1",
								},
							},
						},
						{
							ID:   "City2",
							Name: "City 2",
							Datasets: []QueryDataset{
								{
									TypeCode: "DatasetType2",
								},
							},
						},
					},
				},
			},
		},
	}

	expected := &DatasetsResponse{
		Data: []*DatasetPrefectureResponse{
			{
				Title: "Prefecture 1",
				Data: []*DatasetCityResponse{
					{
						ID:           "City1",
						Title:        "City 1",
						Spec:         "3.4",
						Description:  "Description",
						FeatureTypes: []string{"bldg"},
					},
				},
			},
		},
	}

	datasets := query.ToDatasets()
	assert.Equal(t, expected, datasets)
}
