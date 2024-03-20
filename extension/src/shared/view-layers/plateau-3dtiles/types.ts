import {
  HIGH_TIDE_RISK_LAYER,
  INLAND_FLOODING_RISK_LAYER,
  RIVER_FLOODING_RISK_LAYER,
  TSUNAMI_RISK_LAYER,
} from "../../../prototypes/view-layers";

export type FloodLayerType =
  | typeof INLAND_FLOODING_RISK_LAYER
  | typeof HIGH_TIDE_RISK_LAYER
  | typeof RIVER_FLOODING_RISK_LAYER
  | typeof TSUNAMI_RISK_LAYER;
