import { environmentTypeAtom } from "../../prototypes/view/states/app";
import { graphicsQualityAtom } from "../../prototypes/view/states/graphics";
import { sharedStoreAtomWrapper } from "../sharedAtoms";

export const shareableGraphicsQualityAtom = sharedStoreAtomWrapper(
  "graphicsQuality",
  graphicsQualityAtom,
);
export const shareableEnvironmentTypeAtom = sharedStoreAtomWrapper(
  "environmentType",
  environmentTypeAtom,
);
