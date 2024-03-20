package gcp

type TaskConfig struct {
	GCPProject              string `pp:",omitempty"`
	GCPRegion               string `pp:",omitempty"`
	Topic                   string `pp:",omitempty"`
	GCSHost                 string `pp:",omitempty"`
	GCSBucket               string `pp:",omitempty"`
	DecompressorImage       string `default:"reearth/reearth-cms-decompressor"`
	DecompressorTopic       string `default:"decompress"`
	DecompressorGzipExt     string `default:"gml"`
	DecompressorMachineType string `default:"E2_HIGHCPU_8"`
}
