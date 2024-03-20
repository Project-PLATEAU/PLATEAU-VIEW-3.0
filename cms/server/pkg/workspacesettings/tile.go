package workspacesettings

type TileType string

const (
	TileTypeDefault             TileType = "DEFAULT"
	TileTypeLabelled            TileType = "LABELLED"
	TileTypeRoadMap             TileType = "ROAD_MAP"
	TileTypeOpenStreetMap       TileType = "OPEN_STREET_MAP"
	TileTypeESRITopography      TileType = "ESRI_TOPOGRAPHY"
	TileTypeEarthAtNight        TileType = "EARTH_AT_NIGHT"
	TileTypeJapanGSIStandardMap TileType = "JAPAN_GSI_STANDARD_MAP"
	TileTypeURL                 TileType = "URL"
)

type TileResource struct {
	id    ResourceID
	rtype TileType
	props UrlResourceProps
}

func NewTileResource(id ResourceID, rtype TileType, props UrlResourceProps) *TileResource {
	return &TileResource{
		id:    id.Clone(),
		rtype: rtype,
		props: props,
	}
}

func (r *TileResource) ID() ResourceID {
	return r.id
}

func (r *TileResource) Type() TileType {
	return r.rtype
}

func (r *TileResource) Props() UrlResourceProps {
	return r.props
}
