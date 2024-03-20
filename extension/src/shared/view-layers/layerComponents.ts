// import { BridgeLayer } from "./BridgeLayer";
// import { HeatmapLayer } from "./HeatmapLayer";
// import { LandSlideRiskLayer } from "./LandSlideRiskLayer";
// import { LandUseLayer } from "./LandUseLayer";
import { type LayerComponents } from "../../prototypes/layers";
import { HeatmapLayer, PedestrianLayer, SketchLayer } from "../../prototypes/view-layers";
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
  MY_DATA_LAYER,
  PARK_LAYER,
  PEDESTRIAN_LAYER,
  RAILWAY_LAYER,
  RIVER_FLOODING_RISK_LAYER,
  ROAD_LAYER,
  SHELTER_LAYER,
  SKETCH_LAYER,
  STATION_LAYER,
  STORY_LAYER,
  TSUNAMI_RISK_LAYER,
  URBAN_PLANNING_LAYER,
  USE_CASE_LAYER,
  VEGETATION_LAYER,
} from "../../prototypes/view-layers/layerTypes";

import { FloodLayer } from "./plateau-3dtiles/FloodLayer";

import { BuildingLayer, GeneralDatasetLayer, MyDataLayer, StoryLayer } from ".";
// import { PedestrianLayer } from "./PedestrianLayer";
// import { RiverFloodingRiskLayer } from "./RiverFloodingRiskLayer";
// import { RoadLayer } from "./RoadLayer";
// import { SketchLayer } from "./SketchLayer";
// import { UrbanPlanningLayer } from "./UrbanPlanningLayer";

export const layerComponents: LayerComponents = {
  [HEATMAP_LAYER]: HeatmapLayer,
  [PEDESTRIAN_LAYER]: PedestrianLayer,
  [SKETCH_LAYER]: SketchLayer,
  [MY_DATA_LAYER]: MyDataLayer,
  [STORY_LAYER]: StoryLayer,

  // Dataset layers
  // Building model
  [BUILDING_LAYER]: BuildingLayer,
  // Flood model
  [HIGH_TIDE_RISK_LAYER]: FloodLayer,
  [INLAND_FLOODING_RISK_LAYER]: FloodLayer,
  [RIVER_FLOODING_RISK_LAYER]: FloodLayer,
  [TSUNAMI_RISK_LAYER]: FloodLayer,
  // General
  [BORDER_LAYER]: GeneralDatasetLayer,
  [BRIDGE_LAYER]: GeneralDatasetLayer,
  [CITY_FURNITURE_LAYER]: GeneralDatasetLayer,
  [EMERGENCY_ROUTE_LAYER]: GeneralDatasetLayer,
  [GENERIC_CITY_OBJECT_LAYER]: GeneralDatasetLayer,
  [GLOBAL_LAYER]: GeneralDatasetLayer,
  [LAND_USE_LAYER]: GeneralDatasetLayer,
  [LANDMARK_LAYER]: GeneralDatasetLayer,
  [LAND_SLIDE_RISK_LAYER]: GeneralDatasetLayer,
  [PARK_LAYER]: GeneralDatasetLayer,
  [RAILWAY_LAYER]: GeneralDatasetLayer,
  [ROAD_LAYER]: GeneralDatasetLayer,
  [SHELTER_LAYER]: GeneralDatasetLayer,
  [STATION_LAYER]: GeneralDatasetLayer,
  [URBAN_PLANNING_LAYER]: GeneralDatasetLayer,
  [USE_CASE_LAYER]: GeneralDatasetLayer,
  [VEGETATION_LAYER]: GeneralDatasetLayer,
};
