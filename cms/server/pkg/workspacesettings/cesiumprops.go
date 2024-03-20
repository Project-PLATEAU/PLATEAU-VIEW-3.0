package workspacesettings

type CesiumResourceProps struct {
	name                 string
	url                  string
	image                string
	cesiumIonAssetId     string
	cesiumIonAccessToken string
}

func NewCesiumResourceProps(name, url, image, cesiumIonAssetId, cesiumIonAccessToken string) CesiumResourceProps {
	return CesiumResourceProps{
		name:                 name,
		url:                  url,
		image:                image,
		cesiumIonAssetId:     cesiumIonAssetId,
		cesiumIonAccessToken: cesiumIonAccessToken,
	}
}

func (p CesiumResourceProps) Name() string {
	return p.name
}

func (p CesiumResourceProps) URL() string {
	return p.url
}

func (p CesiumResourceProps) Image() string {
	return p.image
}

func (p CesiumResourceProps) CesiumIonAssetID() string {
	return p.cesiumIonAssetId
}

func (p CesiumResourceProps) CesiumIonAccessToken() string {
	return p.cesiumIonAccessToken
}