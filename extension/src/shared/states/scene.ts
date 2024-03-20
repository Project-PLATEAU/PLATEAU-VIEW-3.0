import { colorModeAtom } from "../../prototypes/shared-states";
import {
  environmentTypeAtom,
  showMapLabelPrimitiveAtom,
  undergroundPrimitiveAtom,
  logarithmicTerrainElevationAtom,
  terrainElevationHeightRangeAtom,
} from "../../prototypes/view/states/app";
import { graphicsQualityAtom } from "../../prototypes/view/states/graphics";
import { CameraPosition } from "../reearth/types";
import { sharedAtom, sharedStoreAtom, sharedStoreAtomWrapper } from "../sharedAtoms";

export const shareableGraphicsQualityAtom = sharedStoreAtomWrapper(
  "graphicsQuality",
  graphicsQualityAtom,
);
export const shareableEnvironmentTypeAtom = sharedStoreAtomWrapper(
  "environmentType",
  environmentTypeAtom,
);

export const shareableUndergroundAtom = sharedStoreAtomWrapper(
  "underground",
  undergroundPrimitiveAtom,
);

export const shareableShowMapLabelAtom = sharedStoreAtomWrapper(
  "ShowMapLabel",
  showMapLabelPrimitiveAtom,
);

export const shareableColorMode = sharedStoreAtomWrapper("ColorMode", colorModeAtom);

export const shareableTerrainElevationHeightRangeAtom = sharedStoreAtomWrapper(
  "terrainElevationHeightRange",
  terrainElevationHeightRangeAtom,
);
export const shareableLogarithmicTerrainElevationAtom = sharedStoreAtomWrapper(
  "logarithmicTerrainElevation",
  logarithmicTerrainElevationAtom,
);

export const sharedInitialCameraAtom = sharedStoreAtom(
  sharedAtom<CameraPosition | undefined>("initialCamera", undefined),
);

export const sharedInitialClockAtom = sharedStoreAtom(
  sharedAtom<number | undefined>("initialClock", undefined),
);
