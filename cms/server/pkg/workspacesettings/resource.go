package workspacesettings

type ResourceType string

const (
	ResourceTypeTile    ResourceType = "TILE"
	ResourceTypeTerrain ResourceType = "TERRAIN"
)

type Resource struct {
	resourceType ResourceType
	tile         *TileResource
	terrain      *TerrainResource
}

func (r *Resource) ResourceType() ResourceType {
	return r.resourceType
}

func (r *Resource) Tile() *TileResource {
	return r.tile
}

func (r *Resource) Terrain() *TerrainResource {
	return r.terrain
}

func NewResource(resourceType ResourceType, tile *TileResource, terrain *TerrainResource) *Resource {
	return &Resource{
		resourceType: resourceType,
		tile:         tile,
		terrain:      terrain,
	}
}

func (r *Resource) SetResourceType(n ResourceType) {
	r.resourceType = n
}

func (r *Resource) SetTile(n *TileResource) {
	r.tile = n
}

func (r *Resource) SetTerrain(n *TerrainResource) {
	r.terrain = n
}