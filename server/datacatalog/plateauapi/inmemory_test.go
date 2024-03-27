package plateauapi

import (
	"context"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestInMemoryRepo_Area(t *testing.T) {
	a := NewInMemoryRepo(&InMemoryRepoContext{
		Areas: Areas{
			AreaTypePrefecture: []Area{
				&Prefecture{Code: "01", Name: "北海道"},
				&Prefecture{Code: "02", Name: "青森県"},
				&Prefecture{Code: "03", Name: "岩手県"},
			},
			AreaTypeCity: []Area{
				&City{Code: "01100", Name: "札幌市", PrefectureCode: "01"},
				&City{Code: "02100", Name: "青森市", PrefectureCode: "02"},
				&City{Code: "02101", Name: "弘前市", PrefectureCode: "02"},
				&City{Code: "03100", Name: "盛岡市", PrefectureCode: "03"},
				&City{Code: "03101", Name: "花巻市", PrefectureCode: "03"},
			},
			AreaTypeWard: []Area{
				&Ward{Code: "01101", Name: "中央区", CityCode: "01100", PrefectureCode: "01"},
				&Ward{Code: "01102", Name: "北区", CityCode: "01100", PrefectureCode: "01"},
			},
		},
	})

	tests := []struct {
		name     string
		code     AreaCode
		expected Area
	}{
		{
			name:     "prefecture",
			code:     "01",
			expected: &Prefecture{Code: "01", Name: "北海道"},
		},
		{
			name:     "city",
			code:     "01100",
			expected: &City{Code: "01100", Name: "札幌市", PrefectureCode: "01"},
		},
		{
			name:     "ward",
			code:     "01101",
			expected: &Ward{Code: "01101", Name: "中央区", CityCode: "01100", PrefectureCode: "01"},
		},
		{
			name:     "not found",
			code:     "99999",
			expected: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			got, err := a.Area(context.Background(), tt.code)
			assert.NoError(t, err)
			assert.Equal(t, tt.expected, got)
		})
	}
}

func TestInMemoryRepo_Areas(t *testing.T) {
	a := NewInMemoryRepo(&InMemoryRepoContext{
		Areas: Areas{
			AreaTypePrefecture: []Area{
				&Prefecture{Code: "01", Name: "北海道"},
				&Prefecture{Code: "02", Name: "青森県"},
				&Prefecture{Code: "03", Name: "岩手県"},
			},
			AreaTypeCity: []Area{
				&City{Code: "01100", Name: "札幌市", PrefectureCode: "01"},
				&City{Code: "02100", Name: "青森市", PrefectureCode: "02"},
				&City{Code: "02101", Name: "弘前市", PrefectureCode: "02"},
				&City{Code: "03100", Name: "盛岡市", PrefectureCode: "03"},
				&City{Code: "03101", Name: "花巻市", PrefectureCode: "03"},
			},
			AreaTypeWard: []Area{
				&Ward{Code: "01101", Name: "中央区", CityCode: "01100", PrefectureCode: "01"},
				&Ward{Code: "01102", Name: "北区", CityCode: "01100", PrefectureCode: "01"},
			},
		},
		Datasets: Datasets{
			DatasetTypeCategoryPlateau: []Dataset{
				&PlateauDataset{TypeCode: "bldg", CityCode: lo.ToPtr(AreaCode("01101"))},
			},
		},
		DatasetTypes: DatasetTypes{
			DatasetTypeCategoryPlateau: []DatasetType{
				&PlateauDatasetType{Code: "bldg"},
			},
		},
	})

	tests := []struct {
		name  string
		input *AreasInput
		want  []Area
	}{
		{
			name:  "no filter",
			input: nil,
			want: []Area{
				&Prefecture{Code: "01", Name: "北海道"},
				&Prefecture{Code: "02", Name: "青森県"},
				&Prefecture{Code: "03", Name: "岩手県"},
				&City{Code: "01100", Name: "札幌市", PrefectureCode: "01"},
				&City{Code: "02100", Name: "青森市", PrefectureCode: "02"},
				&City{Code: "02101", Name: "弘前市", PrefectureCode: "02"},
				&City{Code: "03100", Name: "盛岡市", PrefectureCode: "03"},
				&City{Code: "03101", Name: "花巻市", PrefectureCode: "03"},
				&Ward{Code: "01101", Name: "中央区", CityCode: "01100", PrefectureCode: "01"},
				&Ward{Code: "01102", Name: "北区", CityCode: "01100", PrefectureCode: "01"},
			},
		},
		{
			name: "filter by dataset types",
			input: &AreasInput{
				DatasetTypes: []string{"bldg"},
				ParentCode:   nil,
				SearchTokens: nil,
			},
			want: []Area{
				&Ward{Code: "01101", Name: "中央区", CityCode: "01100", PrefectureCode: "01"},
			},
		},
		{
			name: "filter by prefectures without deep",
			input: &AreasInput{
				ParentCode:   lo.ToPtr(AreaCode("01")),
				DatasetTypes: nil,
				SearchTokens: nil,
			},
			want: []Area{
				&City{Code: "01100", Name: "札幌市", PrefectureCode: "01"},
			},
		},
		{
			name: "filter by prefectures with deep",
			input: &AreasInput{
				ParentCode:   lo.ToPtr(AreaCode("01")),
				DatasetTypes: nil,
				SearchTokens: nil,
				Deep:         lo.ToPtr(true),
			},
			want: []Area{
				&City{Code: "01100", Name: "札幌市", PrefectureCode: "01"},
				&Ward{Code: "01101", Name: "中央区", CityCode: "01100", PrefectureCode: "01"},
				&Ward{Code: "01102", Name: "北区", CityCode: "01100", PrefectureCode: "01"},
			},
		},
		{
			name: "filter by cities",
			input: &AreasInput{
				ParentCode:   lo.ToPtr(AreaCode("01100")),
				DatasetTypes: nil,
				SearchTokens: nil,
			},
			want: []Area{
				&Ward{Code: "01101", Name: "中央区", CityCode: "01100", PrefectureCode: "01"},
				&Ward{Code: "01102", Name: "北区", CityCode: "01100", PrefectureCode: "01"},
			},
		},
		{
			name: "filter by search tokens",
			input: &AreasInput{
				ParentCode:   nil,
				DatasetTypes: nil,
				SearchTokens: []string{"弘前"},
			},
			want: []Area{
				&City{Code: "02101", Name: "弘前市", PrefectureCode: "02"},
			},
		},
		{
			name: "filter by search tokens and dataset types",
			input: &AreasInput{
				ParentCode:   nil,
				DatasetTypes: []string{"bldg"},
				SearchTokens: []string{"弘前"},
			},
			want: []Area{},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			got, err := a.Areas(context.Background(), tt.input)
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestInMemoryRepo_DatasetTypes(t *testing.T) {
	a := NewInMemoryRepo(&InMemoryRepoContext{
		DatasetTypes: DatasetTypes{
			DatasetTypeCategoryPlateau: []DatasetType{
				&PlateauDatasetType{ID: "1", Name: "Plateau Dataset 1", Year: 2022, PlateauSpecID: "ps_2", Category: DatasetTypeCategoryPlateau},
				&PlateauDatasetType{ID: "2", Name: "Plateau Dataset 2", Year: 2022, PlateauSpecID: "ps_2", Category: DatasetTypeCategoryPlateau},
				&PlateauDatasetType{ID: "3", Name: "Plateau Dataset 3", Year: 2023, PlateauSpecID: "ps_3", Category: DatasetTypeCategoryPlateau},
			},
			DatasetTypeCategoryRelated: []DatasetType{
				&RelatedDatasetType{ID: "4", Name: "Related Dataset 1", Category: DatasetTypeCategoryRelated},
				&RelatedDatasetType{ID: "5", Name: "Related Dataset 2", Category: DatasetTypeCategoryRelated},
				&RelatedDatasetType{ID: "6", Name: "Related Dataset 3", Category: DatasetTypeCategoryRelated},
			},
			DatasetTypeCategoryGeneric: []DatasetType{
				&GenericDatasetType{ID: "7", Name: "Generic Dataset 1", Category: DatasetTypeCategoryGeneric},
				&GenericDatasetType{ID: "8", Name: "Generic Dataset 2", Category: DatasetTypeCategoryGeneric},
				&GenericDatasetType{ID: "9", Name: "Generic Dataset 3", Category: DatasetTypeCategoryGeneric},
			},
		},
	})

	tests := []struct {
		name     string
		input    *DatasetTypesInput
		expected []DatasetType
	}{
		{
			name:  "no filter",
			input: nil,
			expected: []DatasetType{
				&PlateauDatasetType{ID: "1", Name: "Plateau Dataset 1", Year: 2022, PlateauSpecID: "ps_2", Category: DatasetTypeCategoryPlateau},
				&PlateauDatasetType{ID: "2", Name: "Plateau Dataset 2", Year: 2022, PlateauSpecID: "ps_2", Category: DatasetTypeCategoryPlateau},
				&PlateauDatasetType{ID: "3", Name: "Plateau Dataset 3", Year: 2023, PlateauSpecID: "ps_3", Category: DatasetTypeCategoryPlateau},
				&RelatedDatasetType{ID: "4", Name: "Related Dataset 1", Category: DatasetTypeCategoryRelated},
				&RelatedDatasetType{ID: "5", Name: "Related Dataset 2", Category: DatasetTypeCategoryRelated},
				&RelatedDatasetType{ID: "6", Name: "Related Dataset 3", Category: DatasetTypeCategoryRelated},
				&GenericDatasetType{ID: "7", Name: "Generic Dataset 1", Category: DatasetTypeCategoryGeneric},
				&GenericDatasetType{ID: "8", Name: "Generic Dataset 2", Category: DatasetTypeCategoryGeneric},
				&GenericDatasetType{ID: "9", Name: "Generic Dataset 3", Category: DatasetTypeCategoryGeneric},
			},
		},
		{
			name: "filter by year",
			input: &DatasetTypesInput{
				Year: lo.ToPtr(2022),
			},
			expected: []DatasetType{
				&PlateauDatasetType{ID: "1", Name: "Plateau Dataset 1", Year: 2022, PlateauSpecID: "ps_2", Category: DatasetTypeCategoryPlateau},
				&PlateauDatasetType{ID: "2", Name: "Plateau Dataset 2", Year: 2022, PlateauSpecID: "ps_2", Category: DatasetTypeCategoryPlateau},
			},
		},
		{
			name: "filter by spec",
			input: &DatasetTypesInput{
				PlateauSpec: lo.ToPtr("2"),
			},
			expected: []DatasetType{
				&PlateauDatasetType{ID: "1", Name: "Plateau Dataset 1", Year: 2022, PlateauSpecID: "ps_2", Category: DatasetTypeCategoryPlateau},
				&PlateauDatasetType{ID: "2", Name: "Plateau Dataset 2", Year: 2022, PlateauSpecID: "ps_2", Category: DatasetTypeCategoryPlateau},
			},
		},
		{
			name: "filter by category",
			input: &DatasetTypesInput{
				Category: lo.ToPtr(DatasetTypeCategoryGeneric),
			},
			expected: []DatasetType{
				&GenericDatasetType{ID: "7", Name: "Generic Dataset 1", Category: DatasetTypeCategoryGeneric},
				&GenericDatasetType{ID: "8", Name: "Generic Dataset 2", Category: DatasetTypeCategoryGeneric},
				&GenericDatasetType{ID: "9", Name: "Generic Dataset 3", Category: DatasetTypeCategoryGeneric},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			got, err := a.DatasetTypes(context.Background(), tt.input)
			assert.NoError(t, err)
			assert.Equal(t, tt.expected, got)
		})
	}
}

func TestInMemoryRepo_Years(t *testing.T) {
	a := NewInMemoryRepo(&InMemoryRepoContext{
		Years: []int{2020, 2021, 2022, 2023},
	})

	expected := []int{2020, 2021, 2022, 2023}

	years, err := a.Years(context.Background())
	assert.NoError(t, err)
	assert.Equal(t, expected, years)
}

func TestInMemoryRepo_Datasets(t *testing.T) {
	a := NewInMemoryRepo(&InMemoryRepoContext{
		Datasets: Datasets{
			DatasetTypeCategoryPlateau: []Dataset{
				&PlateauDataset{ID: "1", Name: "Plateau Dataset 1", Year: 2022, CityCode: lo.ToPtr(AreaCode("01100"))},
				&PlateauDataset{ID: "2", Name: "Plateau Dataset 2", Year: 2022, TypeCode: "bldg"},
				&PlateauDataset{ID: "3", Name: "Plateau Dataset 3", Year: 2023},
			},
			DatasetTypeCategoryRelated: []Dataset{
				&RelatedDataset{ID: "7", Name: "Related Dataset 1", Year: 2022, Description: lo.ToPtr("desc!")},
				&RelatedDataset{ID: "8", Name: "Related Dataset 2", Year: 2022},
				&RelatedDataset{ID: "9", Name: "Related Dataset 3", Year: 2023},
			},
			DatasetTypeCategoryGeneric: []Dataset{
				&GenericDataset{ID: "10", Name: "Generic Dataset 1", Year: 2022},
				&GenericDataset{ID: "11", Name: "Generic Dataset 2", Year: 2022},
				&GenericDataset{ID: "12", Name: "Generic Dataset 3", Year: 2023, CityCode: lo.ToPtr(AreaCode("01100")), WardCode: lo.ToPtr(AreaCode("01101"))},
			},
		},
	})

	tests := []struct {
		name  string
		input *DatasetsInput
		want  []Dataset
	}{
		{
			name:  "no filter",
			input: nil,
			want: []Dataset{
				&PlateauDataset{ID: "1", Name: "Plateau Dataset 1", Year: 2022, CityCode: lo.ToPtr(AreaCode("01100"))},
				&PlateauDataset{ID: "2", Name: "Plateau Dataset 2", Year: 2022, TypeCode: "bldg"},
				&PlateauDataset{ID: "3", Name: "Plateau Dataset 3", Year: 2023},
				&RelatedDataset{ID: "7", Name: "Related Dataset 1", Year: 2022, Description: lo.ToPtr("desc!")},
				&RelatedDataset{ID: "8", Name: "Related Dataset 2", Year: 2022},
				&RelatedDataset{ID: "9", Name: "Related Dataset 3", Year: 2023},
				&GenericDataset{ID: "10", Name: "Generic Dataset 1", Year: 2022},
				&GenericDataset{ID: "11", Name: "Generic Dataset 2", Year: 2022},
				&GenericDataset{ID: "12", Name: "Generic Dataset 3", Year: 2023, CityCode: lo.ToPtr(AreaCode("01100")), WardCode: lo.ToPtr(AreaCode("01101"))},
			},
		},
		{
			name: "filter by an area code",
			input: &DatasetsInput{
				AreaCodes: []AreaCode{"01100"},
			},
			want: []Dataset{
				&PlateauDataset{ID: "1", Name: "Plateau Dataset 1", Year: 2022, CityCode: lo.ToPtr(AreaCode("01100"))},
				&GenericDataset{ID: "12", Name: "Generic Dataset 3", Year: 2023, CityCode: lo.ToPtr(AreaCode("01100")), WardCode: lo.ToPtr(AreaCode("01101"))},
			},
		},
		{
			name: "filter by multiple area codes",
			input: &DatasetsInput{
				AreaCodes: []AreaCode{"01100", "01101"},
			},
			want: []Dataset{
				&PlateauDataset{ID: "1", Name: "Plateau Dataset 1", Year: 2022, CityCode: lo.ToPtr(AreaCode("01100"))},
				&GenericDataset{ID: "12", Name: "Generic Dataset 3", Year: 2023, CityCode: lo.ToPtr(AreaCode("01100")), WardCode: lo.ToPtr(AreaCode("01101"))},
			},
		},
		{
			name: "filter by an area code shallowly",
			input: &DatasetsInput{
				AreaCodes: []AreaCode{"01100"},
				Shallow:   lo.ToPtr(true),
			},
			want: []Dataset{
				&PlateauDataset{ID: "1", Name: "Plateau Dataset 1", Year: 2022, CityCode: lo.ToPtr(AreaCode("01100"))},
			},
		},
		{
			name: "filter by included types",
			input: &DatasetsInput{
				IncludeTypes: []string{"bldg"},
			},
			want: []Dataset{
				&PlateauDataset{ID: "2", Name: "Plateau Dataset 2", Year: 2022, TypeCode: "bldg"},
			},
		},
		{
			name: "filter by excluded types",
			input: &DatasetsInput{
				ExcludeTypes: []string{"bldg"},
			},
			want: []Dataset{
				&PlateauDataset{ID: "1", Name: "Plateau Dataset 1", Year: 2022, CityCode: lo.ToPtr(AreaCode("01100"))},
				&PlateauDataset{ID: "3", Name: "Plateau Dataset 3", Year: 2023},
				&RelatedDataset{ID: "7", Name: "Related Dataset 1", Year: 2022, Description: lo.ToPtr("desc!")},
				&RelatedDataset{ID: "8", Name: "Related Dataset 2", Year: 2022},
				&RelatedDataset{ID: "9", Name: "Related Dataset 3", Year: 2023},
				&GenericDataset{ID: "10", Name: "Generic Dataset 1", Year: 2022},
				&GenericDataset{ID: "11", Name: "Generic Dataset 2", Year: 2022},
				&GenericDataset{ID: "12", Name: "Generic Dataset 3", Year: 2023, CityCode: lo.ToPtr(AreaCode("01100")), WardCode: lo.ToPtr(AreaCode("01101"))},
			},
		},
		{
			name: "filter by search tokens",
			input: &DatasetsInput{
				SearchTokens: []string{"desc"},
			},
			want: []Dataset{
				&RelatedDataset{ID: "7", Name: "Related Dataset 1", Year: 2022, Description: lo.ToPtr("desc!")},
			},
		},
		{
			name: "filter by multiple search tokens",
			input: &DatasetsInput{
				SearchTokens: []string{"desc", "Related"},
			},
			want: []Dataset{
				&RelatedDataset{ID: "7", Name: "Related Dataset 1", Year: 2022, Description: lo.ToPtr("desc!")},
			},
		},
		{
			name: "filter by non-matched multiple search tokens",
			input: &DatasetsInput{
				SearchTokens: []string{"desc", "Related_"},
			},
			want: []Dataset{},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			got, err := a.Datasets(context.Background(), tt.input)
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestInMemoryRepo_Node(t *testing.T) {
	spec := PlateauSpec{
		ID:           NewID("2", TypePlateauSpec),
		MajorVersion: 2,
		Year:         2022,
		MinorVersions: []*PlateauSpecMinor{
			{
				ID:   NewID("2.3", TypePlateauSpec),
				Name: "第2.3版",
			},
		},
	}

	a := NewInMemoryRepo(&InMemoryRepoContext{
		Areas: Areas{
			AreaTypePrefecture: []Area{
				&Prefecture{ID: NewID("01", TypePrefecture), Name: "北海道"},
				&Prefecture{ID: NewID("02", TypePrefecture), Name: "青森県"},
			},
			AreaTypeCity: []Area{
				&City{ID: NewID("01100", TypeCity), Name: "札幌市", PrefectureCode: "01"},
			},
			AreaTypeWard: []Area{
				&Ward{ID: NewID("01101", TypeWard), Name: "中央区", CityCode: "01100", PrefectureCode: "01"},
			},
		},
		DatasetTypes: DatasetTypes{
			DatasetTypeCategoryPlateau: []DatasetType{
				&PlateauDatasetType{ID: NewID("1", TypeDatasetType), Name: "Plateau Dataset 1", Year: 2022},
			},
			DatasetTypeCategoryRelated: []DatasetType{
				&RelatedDatasetType{ID: NewID("2", TypeDatasetType), Name: "Related Dataset 1"},
			},
			DatasetTypeCategoryGeneric: []DatasetType{
				&GenericDatasetType{ID: NewID("3", TypeDatasetType), Name: "Generic Dataset 1"},
			},
		},
		Datasets: Datasets{
			DatasetTypeCategoryPlateau: []Dataset{
				&PlateauDataset{ID: NewID("1", TypeDataset), Name: "Plateau Dataset 1"},
			},
			DatasetTypeCategoryRelated: []Dataset{
				&RelatedDataset{ID: NewID("3", TypeDataset), Name: "Related Dataset 1"},
			},
			DatasetTypeCategoryGeneric: []Dataset{
				&GenericDataset{ID: NewID("4", TypeDataset), Name: "Generic Dataset 1"},
			},
		},
		PlateauSpecs: []PlateauSpec{
			spec,
		},
	})

	tests := []struct {
		name     string
		id       ID
		expected Node
	}{
		{
			name:     "invalid id",
			id:       NewID("99", TypePrefecture),
			expected: nil,
		},
		{
			name:     "prefecture",
			id:       NewID("01", TypePrefecture),
			expected: &Prefecture{ID: NewID("01", TypePrefecture), Name: "北海道"},
		},
		{
			name:     "city",
			id:       NewID("01100", TypeCity),
			expected: &City{ID: NewID("01100", TypeCity), Name: "札幌市", PrefectureCode: "01"},
		},
		{
			name:     "ward",
			id:       NewID("01101", TypeWard),
			expected: &Ward{ID: NewID("01101", TypeWard), Name: "中央区", CityCode: "01100", PrefectureCode: "01"},
		},
		{
			name:     "plateau dataset type",
			id:       NewID("1", TypeDatasetType),
			expected: &PlateauDatasetType{ID: NewID("1", TypeDatasetType), Name: "Plateau Dataset 1", Year: 2022},
		},
		{
			name:     "related dataset type",
			id:       NewID("2", TypeDatasetType),
			expected: &RelatedDatasetType{ID: NewID("2", TypeDatasetType), Name: "Related Dataset 1"},
		},
		{
			name:     "generic dataset type",
			id:       NewID("3", TypeDatasetType),
			expected: &GenericDatasetType{ID: NewID("3", TypeDatasetType), Name: "Generic Dataset 1"},
		},
		{
			name:     "plateau dataset",
			id:       NewID("1", TypeDataset),
			expected: &PlateauDataset{ID: NewID("1", TypeDataset), Name: "Plateau Dataset 1"},
		},
		{
			name:     "related dataset",
			id:       NewID("3", TypeDataset),
			expected: &RelatedDataset{ID: NewID("3", TypeDataset), Name: "Related Dataset 1"},
		},
		{
			name:     "generic dataset",
			id:       NewID("4", TypeDataset),
			expected: &GenericDataset{ID: NewID("4", TypeDataset), Name: "Generic Dataset 1"},
		},
		{
			name:     "spec",
			id:       NewID("2", TypePlateauSpec),
			expected: &spec,
		},
		{
			name:     "spec minor",
			id:       NewID("2.3", TypePlateauSpec),
			expected: spec.MinorVersions[0],
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			got, err := a.Node(context.Background(), tt.id)
			assert.NoError(t, err)
			assert.Equal(t, tt.expected, got)
		})
	}
}

func TestInMemoryRepo_Nodes(t *testing.T) {
	a := NewInMemoryRepo(&InMemoryRepoContext{
		Areas: Areas{
			AreaTypePrefecture: []Area{
				&Prefecture{ID: NewID("01", TypePrefecture), Name: "北海道"},
				&Prefecture{ID: NewID("02", TypePrefecture), Name: "青森県"},
			},
		},
	})

	tests := []struct {
		name     string
		ids      []ID
		expected []Node
	}{
		{
			name:     "empty ids",
			ids:      []ID{},
			expected: []Node{},
		},
		{
			name: "single id",
			ids:  []ID{NewID("01", TypePrefecture)},
			expected: []Node{
				&Prefecture{ID: NewID("01", TypePrefecture), Name: "北海道"},
			},
		},
		{
			name: "multiple ids",
			ids: []ID{
				NewID("01", TypePrefecture),
				NewID("02", TypePrefecture),
			},
			expected: []Node{
				&Prefecture{ID: NewID("01", TypePrefecture), Name: "北海道"},
				&Prefecture{ID: NewID("02", TypePrefecture), Name: "青森県"},
			},
		},
		{
			name: "multiple ids with an invalid id",
			ids: []ID{
				NewID("99", TypePrefecture),
				NewID("02", TypePrefecture),
			},
			expected: []Node{
				nil,
				&Prefecture{ID: NewID("02", TypePrefecture), Name: "青森県"},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			got, err := a.Nodes(context.Background(), tt.ids)
			assert.NoError(t, err)
			assert.Equal(t, tt.expected, got)
		})
	}
}

func TestInMemoryRepo_getDatasetTypeCodes(t *testing.T) {
	c := &InMemoryRepo{
		ctx: &InMemoryRepoContext{
			DatasetTypes: DatasetTypes{
				DatasetTypeCategoryPlateau: []DatasetType{
					&PlateauDatasetType{Code: "1"},
					&PlateauDatasetType{Code: "2"},
					&PlateauDatasetType{Code: "3"},
				},
				DatasetTypeCategoryRelated: []DatasetType{
					&RelatedDatasetType{Code: "4"},
					&RelatedDatasetType{Code: "5"},
					&RelatedDatasetType{Code: "6"},
				},
				DatasetTypeCategoryGeneric: []DatasetType{
					&GenericDatasetType{Code: "7"},
					&GenericDatasetType{Code: "8"},
					&GenericDatasetType{Code: "9"},
				},
			},
		},
	}

	tests := []struct {
		name       string
		types      []string
		categories []DatasetTypeCategory
		expected   []string
	}{
		{
			name:       "ok",
			types:      []string{"1", "4", "7"},
			categories: []DatasetTypeCategory{DatasetTypeCategoryPlateau, DatasetTypeCategoryGeneric},
			expected: []string{
				"1", "7",
			},
		},
		{
			name:       "empty",
			types:      nil,
			categories: nil,
			expected:   []string{"1", "2", "3", "4", "5", "6", "7", "8", "9"}, // all
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := c.getDatasetTypeCodes(tt.types, tt.categories)
			assert.ElementsMatch(t, tt.expected, got)
		})
	}
}
