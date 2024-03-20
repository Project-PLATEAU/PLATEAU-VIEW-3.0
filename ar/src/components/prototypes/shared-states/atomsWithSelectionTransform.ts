import { atom } from "jotai";

import { isNotNullish } from "../type-helpers";

import { type SelectionAtoms } from "./atomsWithSelection";

export function atomsWithSelectionTransform<T, U = T>(
  selectionAtoms: SelectionAtoms<T>,
  transform: (object: U) => T | null | undefined,
) {
  const replaceAtom = atom(
    () => null,
    (_, set, objects: readonly U[]) => {
      set(selectionAtoms.selectionAtom, objects.map(transform).filter(isNotNullish));
    },
  );

  const addAtom = atom(null, (_, set, objects: readonly U[]) => {
    set(selectionAtoms.addAtom, objects.map(transform).filter(isNotNullish));
  });

  const removeAtom = atom(null, (_, set, objects: readonly U[]) => {
    set(selectionAtoms.removeAtom, objects.map(transform).filter(isNotNullish));
  });

  return {
    replaceAtom,
    addAtom,
    removeAtom,
  };
}
