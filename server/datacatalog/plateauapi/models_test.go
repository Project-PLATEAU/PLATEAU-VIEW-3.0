package plateauapi

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFindItem(t *testing.T) {
	d := &PlateauDataset{
		Items: []*PlateauDatasetItem{
			{ID: "1"},
			{ID: "2"},
			{ID: "3"},
		},
	}

	expected := &PlateauDatasetItem{ID: "2"}
	result := FindItem(d, ID("2"))

	assert.Equal(t, expected, result)
}

func TestAreas_Append(t *testing.T) {
	a := Areas{
		AreaTypePrefecture: []Area{
			&Prefecture{ID: "1"},
			&Prefecture{ID: "2"},
		},
		AreaTypeCity: []Area{
			&City{ID: "3"},
			&City{ID: "4"},
		},
	}

	as := []Area{
		&City{ID: "5"},
		&City{ID: "6"},
	}

	expected := Areas{
		AreaTypePrefecture: []Area{
			&Prefecture{ID: "1"},
			&Prefecture{ID: "2"},
		},
		AreaTypeCity: []Area{
			&City{ID: "3"},
			&City{ID: "4"},
			&City{ID: "5"},
			&City{ID: "6"},
		},
	}

	a.Append(AreaTypeCity, as)

	assert.Equal(t, expected, a)
}

func TestAreas_All(t *testing.T) {
	a := Areas{
		AreaTypePrefecture: []Area{
			&Prefecture{ID: "1"},
			&Prefecture{ID: "2"},
		},
		AreaTypeCity: []Area{
			&City{ID: "3"},
			&City{ID: "4"},
		},
		AreaTypeWard: []Area{
			&Ward{ID: "5"},
			&Ward{ID: "6"},
		},
	}

	expected := []Area{
		&Prefecture{ID: "1"},
		&Prefecture{ID: "2"},
		&City{ID: "3"},
		&City{ID: "4"},
		&Ward{ID: "5"},
		&Ward{ID: "6"},
	}

	result := a.All()

	assert.Equal(t, expected, result)
}

func TestAreas_Area(t *testing.T) {
	a := Areas{
		AreaTypePrefecture: []Area{
			&Prefecture{ID: "1"},
			&Prefecture{ID: "2"},
		},
		AreaTypeCity: []Area{
			&City{ID: "3"},
			&City{ID: "4"},
		},
		AreaTypeWard: []Area{
			&Ward{ID: "5"},
			&Ward{ID: "6"},
		},
	}

	expected := &City{ID: "4"}
	result := a.Area(ID("4"))

	assert.Equal(t, expected, result)
}

func TestDatasets_Append(t *testing.T) {
	d := Datasets{
		DatasetTypeCategoryPlateau: []Dataset{
			&PlateauDataset{ID: "1"},
			&PlateauDataset{ID: "2"},
		},
		DatasetTypeCategoryRelated: []Dataset{
			&RelatedDataset{ID: "3"},
			&RelatedDataset{ID: "4"},
		},
	}

	ds := []Dataset{
		&RelatedDataset{ID: "5"},
		&RelatedDataset{ID: "6"},
	}

	expected := Datasets{
		DatasetTypeCategoryPlateau: []Dataset{
			&PlateauDataset{ID: "1"},
			&PlateauDataset{ID: "2"},
		},
		DatasetTypeCategoryRelated: []Dataset{
			&RelatedDataset{ID: "3"},
			&RelatedDataset{ID: "4"},
			&RelatedDataset{ID: "5"},
			&RelatedDataset{ID: "6"},
		},
	}

	d.Append(DatasetTypeCategoryRelated, ds)

	assert.Equal(t, expected, d)
}

func TestDatasets_All(t *testing.T) {
	d := Datasets{
		DatasetTypeCategoryPlateau: []Dataset{
			&PlateauDataset{ID: "1"},
			&PlateauDataset{ID: "2"},
		},
		DatasetTypeCategoryRelated: []Dataset{
			&RelatedDataset{ID: "3"},
			&RelatedDataset{ID: "4"},
		},
		DatasetTypeCategoryGeneric: []Dataset{
			&GenericDataset{ID: "5"},
			&GenericDataset{ID: "6"},
		},
	}

	expected := []Dataset{
		&PlateauDataset{ID: "1"},
		&PlateauDataset{ID: "2"},
		&RelatedDataset{ID: "3"},
		&RelatedDataset{ID: "4"},
		&GenericDataset{ID: "5"},
		&GenericDataset{ID: "6"},
	}

	result := d.All()

	assert.Equal(t, expected, result)
}

func TestDatasets_Dataset(t *testing.T) {
	d := Datasets{
		DatasetTypeCategoryPlateau: []Dataset{
			&PlateauDataset{ID: "1"},
			&PlateauDataset{ID: "2"},
		},
		DatasetTypeCategoryRelated: []Dataset{
			&RelatedDataset{ID: "3"},
			&RelatedDataset{ID: "4"},
		},
		DatasetTypeCategoryGeneric: []Dataset{
			&GenericDataset{ID: "5"},
			&GenericDataset{ID: "6"},
		},
	}

	expected := &PlateauDataset{ID: "2"}
	result := d.Dataset(ID("2"))

	assert.Equal(t, expected, result)
}

func TestDatasets_Item(t *testing.T) {
	d := Datasets{
		DatasetTypeCategoryPlateau: []Dataset{
			&PlateauDataset{
				ID: "1",
				Items: []*PlateauDatasetItem{
					{ID: "1"},
					{ID: "2"},
					{ID: "3"},
				},
			},
			&PlateauDataset{
				ID: "2",
				Items: []*PlateauDatasetItem{
					{ID: "4"},
					{ID: "5"},
					{ID: "6"},
				},
			},
		},
		DatasetTypeCategoryRelated: []Dataset{
			&RelatedDataset{
				ID: "3",
				Items: []*RelatedDatasetItem{
					{ID: "7"},
					{ID: "8"},
					{ID: "9"},
				},
			},
			&RelatedDataset{
				ID: "4",
				Items: []*RelatedDatasetItem{
					{ID: "10"},
					{ID: "11"},
					{ID: "12"},
				},
			},
		},
		DatasetTypeCategoryGeneric: []Dataset{
			&GenericDataset{
				ID: "5",
				Items: []*GenericDatasetItem{
					{ID: "13"},
					{ID: "14"},
					{ID: "15"},
				},
			},
			&GenericDataset{
				ID: "6",
				Items: []*GenericDatasetItem{
					{ID: "16"},
					{ID: "17"},
					{ID: "18"},
				},
			},
		},
	}

	expected := &PlateauDatasetItem{ID: "5"}
	result := d.Item(ID("5"))

	assert.Equal(t, expected, result)
}

func TestDatasetTypes_Append(t *testing.T) {
	d := DatasetTypes{
		DatasetTypeCategoryPlateau: []DatasetType{
			&PlateauDatasetType{ID: "1"},
			&PlateauDatasetType{ID: "2"},
		},
		DatasetTypeCategoryRelated: []DatasetType{
			&RelatedDatasetType{ID: "3"},
			&RelatedDatasetType{ID: "4"},
		},
	}

	ds := []DatasetType{
		&RelatedDatasetType{ID: "5"},
		&RelatedDatasetType{ID: "6"},
	}

	expected := DatasetTypes{
		DatasetTypeCategoryPlateau: []DatasetType{
			&PlateauDatasetType{ID: "1"},
			&PlateauDatasetType{ID: "2"},
		},
		DatasetTypeCategoryRelated: []DatasetType{
			&RelatedDatasetType{ID: "3"},
			&RelatedDatasetType{ID: "4"},
			&RelatedDatasetType{ID: "5"},
			&RelatedDatasetType{ID: "6"},
		},
	}

	d.Append(DatasetTypeCategoryRelated, ds)

	assert.Equal(t, expected, d)
}

func TestDatasetTypes_All(t *testing.T) {
	d := DatasetTypes{
		DatasetTypeCategoryPlateau: []DatasetType{
			&PlateauDatasetType{ID: "1"},
			&PlateauDatasetType{ID: "2"},
		},
		DatasetTypeCategoryRelated: []DatasetType{
			&RelatedDatasetType{ID: "3"},
			&RelatedDatasetType{ID: "4"},
		},
		DatasetTypeCategoryGeneric: []DatasetType{
			&GenericDatasetType{ID: "5"},
			&GenericDatasetType{ID: "6"},
		},
	}

	expected := []DatasetType{
		&PlateauDatasetType{ID: "1"},
		&PlateauDatasetType{ID: "2"},
		&RelatedDatasetType{ID: "3"},
		&RelatedDatasetType{ID: "4"},
		&GenericDatasetType{ID: "5"},
		&GenericDatasetType{ID: "6"},
	}

	result := d.All()

	assert.Equal(t, expected, result)
}

func TestDatasetTypes_DatasetTypesByCategories(t *testing.T) {
	d := DatasetTypes{
		DatasetTypeCategoryPlateau: []DatasetType{
			&PlateauDatasetType{ID: "1", Code: "code1"},
			&PlateauDatasetType{ID: "2", Code: "code2"},
		},
		DatasetTypeCategoryRelated: []DatasetType{
			&RelatedDatasetType{ID: "3", Code: "code3"},
			&RelatedDatasetType{ID: "4", Code: "code4"},
		},
		DatasetTypeCategoryGeneric: []DatasetType{
			&GenericDatasetType{ID: "5", Code: "code5"},
			&GenericDatasetType{ID: "6", Code: "code6"},
		},
	}

	categories := []DatasetTypeCategory{
		DatasetTypeCategoryPlateau,
		DatasetTypeCategoryRelated,
	}

	expected := []DatasetType{
		&PlateauDatasetType{ID: "1", Code: "code1"},
		&PlateauDatasetType{ID: "2", Code: "code2"},
		&RelatedDatasetType{ID: "3", Code: "code3"},
		&RelatedDatasetType{ID: "4", Code: "code4"},
	}

	result := d.DatasetTypesByCategories(categories)

	assert.Equal(t, expected, result)
}

func TestDatasetTypes_DatasetType(t *testing.T) {
	d := DatasetTypes{
		DatasetTypeCategoryPlateau: []DatasetType{
			&PlateauDatasetType{ID: "1"},
			&PlateauDatasetType{ID: "2"},
		},
		DatasetTypeCategoryRelated: []DatasetType{
			&RelatedDatasetType{ID: "3"},
			&RelatedDatasetType{ID: "4"},
		},
		DatasetTypeCategoryGeneric: []DatasetType{
			&GenericDatasetType{ID: "5"},
			&GenericDatasetType{ID: "6"},
		},
	}

	expected := &PlateauDatasetType{ID: "2"}
	result := d.DatasetType(ID("2"))

	assert.Equal(t, expected, result)
}

func TestPlateauDatasetToGenericDataset(t *testing.T) {
	d := &PlateauDataset{
		ID:       "d_1",
		Admin:    map[string]any{"sample": true},
		TypeID:   "dt_bldg",
		TypeCode: "bldg",
		Items: []*PlateauDatasetItem{
			{
				ID:       "di_1_2",
				Format:   DatasetFormatCesium3dtiles,
				Name:     "LOD1",
				URL:      "hoge",
				Layers:   []string{"layer"},
				ParentID: "d_1",
			},
		},
	}

	expected := &GenericDataset{
		ID:       "d_1_sample",
		Admin:    map[string]any{"sample": true},
		TypeID:   "dt_sample",
		TypeCode: "sample",
		Items: []*GenericDatasetItem{
			{
				ID:       "di_1_sample_2",
				Format:   DatasetFormatCesium3dtiles,
				Name:     "LOD1",
				URL:      "hoge",
				Layers:   []string{"layer"},
				ParentID: "d_1_sample",
			},
		},
	}

	actual := PlateauDatasetToGenericDataset(d, "dt_sample", "sample", "sample")

	assert.Equal(t, expected, actual)
}
