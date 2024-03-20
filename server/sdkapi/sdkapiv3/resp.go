package sdkapiv3

type DatasetsResponse struct {
	Data []*DatasetPrefectureResponse `json:"data"`
}

type DatasetPrefectureResponse struct {
	ID    string                 `json:"id"`
	Title string                 `json:"title"`
	Data  []*DatasetCityResponse `json:"data"`
}

type DatasetCityResponse struct {
	ID           string   `json:"id"`
	Title        string   `json:"title"`
	Spec         string   `json:"spec"`
	Description  string   `json:"description"`
	FeatureTypes []string `json:"featureTypes"`
}

type DatasetFilesResponse map[string][]DatasetFilesResponseItem

type DatasetFilesResponseItem struct {
	Code   string `json:"code"`
	MaxLod int    `json:"maxLod"`
	URL    string `json:"url"`
}
