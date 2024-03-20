import { atom } from "jotai";

import { ScreenSpaceSelectionEntry, screenSpaceSelectionAtom } from "../screen-space-selection";

import { SKETCH_OBJECT } from "./types";

export const sketchSelectionAtom = atom(get => {
  return get(screenSpaceSelectionAtom).filter(
    (entry): entry is ScreenSpaceSelectionEntry<typeof SKETCH_OBJECT> =>
      entry.type === SKETCH_OBJECT,
  );
});
