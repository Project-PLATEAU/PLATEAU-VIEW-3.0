import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

import { TILESET_FEATURE } from "../../shared/reearth/layers";
import {
  screenSpaceSelectionAtom,
  type ScreenSpaceSelectionEntry,
} from "../screen-space-selection";

export const showTilesetTextureAtom = atomWithReset(true);
export const showTilesetWireframeAtom = atomWithReset(false);
export const showTilesetBoundingVolumeAtom = atomWithReset(false);

export const featureSelectionAtom = atom(get => {
  return get(screenSpaceSelectionAtom).filter(
    (entry): entry is ScreenSpaceSelectionEntry<typeof TILESET_FEATURE> =>
      entry.type === TILESET_FEATURE,
  );
});
