import {
  HIGH_TIDE_RISK_LAYER,
  INLAND_FLOODING_RISK_LAYER,
  RIVER_FLOODING_RISK_LAYER,
  TSUNAMI_RISK_LAYER,
} from "../../../prototypes/view-layers";

import { FloodLayerType } from "./types";

export const FLOOD_LAYER_TYPES: FloodLayerType[] = [
  INLAND_FLOODING_RISK_LAYER,
  HIGH_TIDE_RISK_LAYER,
  RIVER_FLOODING_RISK_LAYER,
  TSUNAMI_RISK_LAYER,
];
