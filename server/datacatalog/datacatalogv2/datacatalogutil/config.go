package datacatalogutil

type DataCatalogItemConfig struct {
	Data []DataCatalogItemConfigItem `json:"data,omitempty"`
}

type DataCatalogItemConfigItem struct {
	Name           string   `json:"name"`
	URL            string   `json:"url"`
	Type           string   `json:"type"`
	Layers         []string `json:"layer,omitempty"`
	OriginalURL    string   `json:"originalUrl,omitempty"`
	OriginalFormat string   `json:"originalFormat,omitempty"`
}
