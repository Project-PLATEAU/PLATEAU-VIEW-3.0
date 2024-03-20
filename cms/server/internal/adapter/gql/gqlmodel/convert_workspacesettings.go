package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/samber/lo"
)

func ToWorkspaceSettings(ws *workspacesettings.WorkspaceSettings) *WorkspaceSettings {
	if ws == nil {
		return nil
	}

	return &WorkspaceSettings{
		ID:       IDFrom(ws.ID()),
		Tiles:    ToResourceList(ws.Tiles()),
		Terrains: ToResourceList(ws.Terrains()),
	}
}

func ToResourceList(resource *workspacesettings.ResourceList) *ResourceList {
	if resource == nil {
		return nil
	}

	r := lo.Map(resource.Resources(), func(r *workspacesettings.Resource, _ int) Resource {
		return ToResource(r)
	})
	wr := &ResourceList{
		Resources:        r,
		SelectedResource: IDFromRef(resource.SelectedResource()),
		Enabled:          resource.Enabled(),
	}
	return wr
}

func ToTileType(tt workspacesettings.TileType) TileType {
	switch tt {
	case workspacesettings.TileTypeDefault:
		return TileTypeDefault
	case workspacesettings.TileTypeLabelled:
		return TileTypeLabelled
	case workspacesettings.TileTypeRoadMap:
		return TileTypeRoadMap
	case workspacesettings.TileTypeOpenStreetMap:
		return TileTypeOpenStreetMap
	case workspacesettings.TileTypeESRITopography:
		return TileTypeEsriTopography
	case workspacesettings.TileTypeEarthAtNight:
		return TileTypeEarthAtNight
	case workspacesettings.TileTypeJapanGSIStandardMap:
		return TileTypeJapanGsiStandardMap
	case workspacesettings.TileTypeURL:
		return TileTypeURL
	default:
		return TileTypeDefault
	}
}

func ToTerrainType(tt workspacesettings.TerrainType) TerrainType {
	switch tt {
	case workspacesettings.TerrainTypeCesiumWorldTerrain:
		return TerrainTypeCesiumWorldTerrain
	case workspacesettings.TerrainTypeArcGISTerrain:
		return TerrainTypeArcGisTerrain
	case workspacesettings.TerrainTypeCesiumIon:
		return TerrainTypeCesiumIon
	default:
		return TerrainTypeCesiumWorldTerrain
	}
}

func ToResource(r *workspacesettings.Resource) Resource {
	if r == nil {
		return nil
	}
	if r.Tile() != nil {
		return TileResource{
			ID:    IDFrom(r.Tile().ID()),
			Type:  ToTileType(r.Tile().Type()),
			Props: ToUrlResourceProps(r.Tile().Props()),
		}
	}
	if r.Terrain() != nil {
		return TerrainResource{
			ID:    IDFrom(r.Terrain().ID()),
			Type:  ToTerrainType(r.Terrain().Type()),
			Props: ToCesiumResourceProps(r.Terrain().Props()),
		}
	}

	return nil
}

func ToUrlResourceProps(r workspacesettings.UrlResourceProps) *URLResourceProps {
	return &URLResourceProps{
		Name:  r.Name(),
		URL:   r.URL(),
		Image: r.Image(),
	}
}

func ToCesiumResourceProps(r workspacesettings.CesiumResourceProps) *CesiumResourceProps {
	return &CesiumResourceProps{
		Name:                 r.Name(),
		URL:                  r.URL(),
		Image:                r.Image(),
		CesiumIonAssetID:     r.CesiumIonAssetID(),
		CesiumIonAccessToken: r.CesiumIonAccessToken(),
	}
}

func FromResourceList(wr *ResourcesListInput) *workspacesettings.ResourceList {
	if wr == nil {
		return nil
	}
	r := lo.Map(wr.Resources, func(r *ResourceInput, _ int) *workspacesettings.Resource {
		return FromResource(r)
	})
	rid := ToIDRef[id.Resource](wr.SelectedResource)
	return workspacesettings.NewResourceList(r, rid, wr.Enabled)
}

func FromResource(r *ResourceInput) *workspacesettings.Resource {
	if r == nil {
		return nil
	}

	if r.Tile != nil {
		rid, err := ToID[id.Resource](r.Tile.ID)
		if err != nil {
			return nil
		}

		tile := workspacesettings.NewTileResource(rid, FromTileType(r.Tile.Type), FromUrlResourceProps(r.Tile.Props))
		return workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tile, nil)
	}

	if r.Terrain != nil {
		rid, err := ToID[id.Resource](r.Terrain.ID)
		if err != nil {
			return nil
		}

		terrain := workspacesettings.NewTerrainResource(rid, FromTerrainType(r.Terrain.Type), FromCesiumResourceProps(r.Terrain.Props))
		return workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, terrain)
	}

	return nil
}

func FromTerrainType(tt TerrainType) workspacesettings.TerrainType {
	switch tt {
	case TerrainTypeCesiumWorldTerrain:
		return workspacesettings.TerrainTypeCesiumWorldTerrain
	case TerrainTypeArcGisTerrain:
		return workspacesettings.TerrainTypeArcGISTerrain
	case TerrainTypeCesiumIon:
		return workspacesettings.TerrainTypeCesiumIon
	default:
		return workspacesettings.TerrainTypeCesiumWorldTerrain
	}
}

func FromTileType(tt TileType) workspacesettings.TileType {
	switch tt {
	case TileTypeDefault:
		return workspacesettings.TileTypeDefault
	case TileTypeLabelled:
		return workspacesettings.TileTypeLabelled
	case TileTypeRoadMap:
		return workspacesettings.TileTypeRoadMap
	case TileTypeOpenStreetMap:
		return workspacesettings.TileTypeOpenStreetMap
	case TileTypeEsriTopography:
		return workspacesettings.TileTypeESRITopography
	case TileTypeEarthAtNight:
		return workspacesettings.TileTypeEarthAtNight
	case TileTypeJapanGsiStandardMap:
		return workspacesettings.TileTypeJapanGSIStandardMap
	case TileTypeURL:
		return workspacesettings.TileTypeURL
	default:
		return workspacesettings.TileTypeDefault
	}
}

func FromUrlResourceProps(r *URLResourcePropsInput) workspacesettings.UrlResourceProps {
	return workspacesettings.NewURLResourceProps(r.Name, r.URL, r.Image)
}

func FromCesiumResourceProps(r *CesiumResourcePropsInput) workspacesettings.CesiumResourceProps {
	return workspacesettings.NewCesiumResourceProps(r.Name, r.URL, r.Image, r.CesiumIonAssetID, r.CesiumIonAccessToken)
}
