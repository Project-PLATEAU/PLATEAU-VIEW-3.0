import { type SetOptional } from "type-fest";

// import { createBridgeLayer, type BridgeLayerModelParams } from "./BridgeLayer";

import { type LayerModel, type LayerType } from "../../prototypes/layers";
import {
  BORDER_LAYER,
  BRIDGE_LAYER,
  BUILDING_LAYER,
  CITY_FURNITURE_LAYER,
  EMERGENCY_ROUTE_LAYER,
  GENERIC_CITY_OBJECT_LAYER,
  GLOBAL_LAYER,
  HEATMAP_LAYER,
  HIGH_TIDE_RISK_LAYER,
  INLAND_FLOODING_RISK_LAYER,
  LAND_SLIDE_RISK_LAYER,
  LAND_USE_LAYER,
  LANDMARK_LAYER,
  PARK_LAYER,
  PEDESTRIAN_LAYER,
  RAILWAY_LAYER,
  RIVER_FLOODING_RISK_LAYER,
  ROAD_LAYER,
  SHELTER_LAYER,
  SKETCH_LAYER,
  STATION_LAYER,
  TSUNAMI_RISK_LAYER,
  URBAN_PLANNING_LAYER,
  USE_CASE_LAYER,
  VEGETATION_LAYER,
} from "../../prototypes/view-layers";

import { GeneralLayerModelParams, createGeneralDatasetLayer } from "./general";
import {
  createBuildingLayer,
  type BuildingLayerModelParams,
} from "./plateau-3dtiles/BuildingLayer";
import { FloodLayerModelParams, createFloodLayer } from "./plateau-3dtiles/FloodLayer";
// import { createHeatmapLayer, type HeatmapLayerModelParams } from "./HeatmapLayer";
// import { createLandSlideRiskLayer, type LandSlideRiskLayerModelParams } from "./LandSlideRiskLayer";
// import { createLandUseLayer, type LandUseLayerModelParams } from "./LandUseLayer";
// import { createPedestrianLayer, type PedestrianLayerModelParams } from "./PedestrianLayer";
// import {
//   createRiverFloodingRiskLayer,
//   type RiverFloodingRiskLayerModelParams,
// } from "./RiverFloodingRiskLayer";
// import { createRoadLayer, type RoadLayerModelParams } from "./RoadLayer";
// import { createSketchLayer, type SketchLayerModelParams } from "./SketchLayer";
// import { createUrbanPlanningLayer, type UrbanPlanningLayerModelParams } from "./UrbanPlanningLayer";

// prettier-ignore
type ViewLayerModelParams<T extends LayerType> =
  T extends typeof HEATMAP_LAYER ? never : // HeatmapLayerModelParams :
  T extends typeof PEDESTRIAN_LAYER ? never : // PedestrianLayerModelParams :
  T extends typeof SKETCH_LAYER ? never : // SketchLayerModelParams :

  // Dataset layers
  T extends typeof BORDER_LAYER ? GeneralLayerModelParams : // BorderLayerModelParams
  T extends typeof BRIDGE_LAYER ? GeneralLayerModelParams : // BridgeLayerModelParams :
  T extends typeof BUILDING_LAYER ? BuildingLayerModelParams :
  T extends typeof CITY_FURNITURE_LAYER ? GeneralLayerModelParams : // CityFurnitureLayerModelParams
  T extends typeof EMERGENCY_ROUTE_LAYER ? GeneralLayerModelParams : // EmergencyRouteLayerModelParams
  T extends typeof GENERIC_CITY_OBJECT_LAYER ? GeneralLayerModelParams : // GenericLayerModelParams
  T extends typeof GLOBAL_LAYER ? GeneralLayerModelParams : // GenericLayerModelParams
  T extends typeof HIGH_TIDE_RISK_LAYER ? GeneralLayerModelParams : // HighTideRiskLayerModelParams
  T extends typeof INLAND_FLOODING_RISK_LAYER ? GeneralLayerModelParams : // InlandFloodingRiskLayerModelParams
  T extends typeof LAND_USE_LAYER ? GeneralLayerModelParams : // LandUseLayerModelParams :
  T extends typeof LANDMARK_LAYER ? GeneralLayerModelParams : // LandmarkLayerModelParams
  T extends typeof LAND_SLIDE_RISK_LAYER ? GeneralLayerModelParams : // LandSlideRiskLayerModelParams :
  T extends typeof PARK_LAYER ? GeneralLayerModelParams : // ParkLayerModelParams
  T extends typeof RAILWAY_LAYER ? GeneralLayerModelParams : // RailwayLayerModelParams
  T extends typeof RIVER_FLOODING_RISK_LAYER ? GeneralLayerModelParams : // RiverFloodingRiskLayerModelParams :
  T extends typeof ROAD_LAYER ? GeneralLayerModelParams : // RoadLayerModelParams :
  T extends typeof SHELTER_LAYER ? GeneralLayerModelParams : // ShelterLayerModelParams
  T extends typeof STATION_LAYER ? GeneralLayerModelParams : // StationLayerModelParams
  T extends typeof TSUNAMI_RISK_LAYER ? GeneralLayerModelParams : // TsunamiRiskLayerModelParams
  T extends typeof URBAN_PLANNING_LAYER ? GeneralLayerModelParams :// UrbanPlanningLayerModelParams :
  T extends typeof USE_CASE_LAYER ? GeneralLayerModelParams : // UseCaseLayerModelParams
  T extends typeof VEGETATION_LAYER ? GeneralLayerModelParams : // VegetationLayerModelParams
  never

export function createViewLayer<T extends LayerType>(
  params: ViewLayerModelParams<T> & { type: T },
): SetOptional<LayerModel<T>, "id">;

// TODO: Refine types
export function createViewLayer<T extends LayerType>(
  params: ViewLayerModelParams<T> & { type: T },
): SetOptional<LayerModel, "id"> | undefined {
  // prettier-ignore
  switch (params.type) {
    case HEATMAP_LAYER: return undefined // createHeatmapLayer(params as HeatmapLayerModelParams)
    case PEDESTRIAN_LAYER: return undefined // createPedestrianLayer(params as PedestrianLayerModelParams)
    case SKETCH_LAYER: return undefined // createSketchLayer(params as SketchLayerModelParams)

    // Dataset layers
    // Building model
    case BUILDING_LAYER: return createBuildingLayer(params as BuildingLayerModelParams)
    // Flood model
    case INLAND_FLOODING_RISK_LAYER: return createFloodLayer(params as FloodLayerModelParams)
    case HIGH_TIDE_RISK_LAYER: return createFloodLayer(params as FloodLayerModelParams)
    case RIVER_FLOODING_RISK_LAYER: return createFloodLayer(params as FloodLayerModelParams)
    case TSUNAMI_RISK_LAYER: return createFloodLayer(params as FloodLayerModelParams)
    // General
    case BORDER_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case BRIDGE_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case CITY_FURNITURE_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case EMERGENCY_ROUTE_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case GENERIC_CITY_OBJECT_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case GLOBAL_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case LAND_USE_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case LANDMARK_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case LAND_SLIDE_RISK_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case PARK_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case RAILWAY_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case ROAD_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case SHELTER_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case STATION_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case URBAN_PLANNING_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case USE_CASE_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
    case VEGETATION_LAYER: return createGeneralDatasetLayer(params as GeneralLayerModelParams)
  }
}
