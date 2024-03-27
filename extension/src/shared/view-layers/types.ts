import {
  AREA_LAYER,
  BORDER_LAYER,
  BRIDGE_LAYER,
  BUILDING_LAYER,
  CITY_FURNITURE_LAYER,
  EMERGENCY_ROUTE_LAYER,
  GENERIC_CITY_OBJECT_LAYER,
  GLOBAL_LAYER,
  HEATMAP_LAYER,
  HIGH_TIDE_RISK_LAYER,
  HeatmapLayerModel,
  INLAND_FLOODING_RISK_LAYER,
  LANDMARK_LAYER,
  LAND_SLIDE_RISK_LAYER,
  LAND_USE_LAYER,
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
  WATERWAY_LAYER,
  VEGETATION_LAYER,
} from "../../prototypes/view-layers";
import { PedestrianLayerModel } from "../../prototypes/view-layers/PedestrianLayer";
import { SketchLayerModel } from "../../prototypes/view-layers/SketchLayer";

import { GeneralLayerModel } from "./general";
import { MyDataLayerModel } from "./myData";
import { BuildingLayerModel } from "./plateau-3dtiles";
import { FloodLayerModel } from "./plateau-3dtiles/FloodLayer";
import { StoryLayerModel } from "./story";

export interface LayerModelOverrides {
  [HEATMAP_LAYER]: HeatmapLayerModel; // HeatmapLayerModel;
  [PEDESTRIAN_LAYER]: PedestrianLayerModel;
  [SKETCH_LAYER]: SketchLayerModel;
  [MY_DATA_LAYER]: MyDataLayerModel;
  [STORY_LAYER]: StoryLayerModel;

  // Dataset layers
  // Building model
  [BUILDING_LAYER]: BuildingLayerModel;
  // Flood model
  [INLAND_FLOODING_RISK_LAYER]: FloodLayerModel; // InlandFloodingRiskLayerModel
  [HIGH_TIDE_RISK_LAYER]: FloodLayerModel; // HighTideRiskLayerModel
  [RIVER_FLOODING_RISK_LAYER]: FloodLayerModel; // RiverFloodingRiskLayerModel;
  [TSUNAMI_RISK_LAYER]: FloodLayerModel; // TsunamiRiskLayerModel
  // General
  [AREA_LAYER]: GeneralLayerModel; // AreaLayerModel
  [BORDER_LAYER]: GeneralLayerModel; // BorderLayerModel
  [BRIDGE_LAYER]: GeneralLayerModel; // BridgeLayerModel;
  [CITY_FURNITURE_LAYER]: GeneralLayerModel; // CityFurnitureLayerModel
  [EMERGENCY_ROUTE_LAYER]: GeneralLayerModel; // EmergencyRouteLayerModel
  [GENERIC_CITY_OBJECT_LAYER]: GeneralLayerModel; // GenericLayerModel
  [GLOBAL_LAYER]: GeneralLayerModel;
  [LAND_USE_LAYER]: GeneralLayerModel; // LandUseLayerModel;
  [LANDMARK_LAYER]: GeneralLayerModel; // LandmarkLayerModel
  [LAND_SLIDE_RISK_LAYER]: GeneralLayerModel; // LandSlideRiskLayerModel;
  [PARK_LAYER]: GeneralLayerModel; // ParkLayerModel
  [RAILWAY_LAYER]: GeneralLayerModel; // RailwayLayerModel
  [ROAD_LAYER]: GeneralLayerModel; // RoadLayerModel;
  [SHELTER_LAYER]: GeneralLayerModel; // ShelterLayerModel
  [STATION_LAYER]: GeneralLayerModel; // StationLayerModel
  [URBAN_PLANNING_LAYER]: GeneralLayerModel; // UrbanPlanningLayerModel;
  [USE_CASE_LAYER]: GeneralLayerModel; // UseCaseLayerModel
  [WATERWAY_LAYER]: GeneralLayerModel; // WaterWayLayerModel
  [VEGETATION_LAYER]: GeneralLayerModel; // VegetationLayerModel
}
