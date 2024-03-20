package workspacesettings

type TerrainType string

const (
	TerrainTypeCesiumWorldTerrain TerrainType = "CESIUM_WORLD_TERRAIN"
	TerrainTypeArcGISTerrain      TerrainType = "ARC_GIS_TERRAIN"
	TerrainTypeCesiumIon          TerrainType = "CESIUM_ION"
)

type TerrainResource struct {
	id    ResourceID
	rtype TerrainType
	props CesiumResourceProps
}


func NewTerrainResource(id ResourceID, rtype TerrainType, props CesiumResourceProps) *TerrainResource {
	return &TerrainResource{
		id:    id.Clone(),
		rtype: rtype,
		props: props,
	}
}

func (r *TerrainResource) ID() ResourceID {
	return r.id
}

func (r *TerrainResource) Type() TerrainType {
	return r.rtype
}

func (r *TerrainResource) Props() CesiumResourceProps {
	return r.props
}