import { atom } from "jotai";
import { type RESET, type useResetAtom } from "jotai/utils";

type ResettableAtom = Parameters<typeof useResetAtom>[0];

export function atomWithResettableAtoms(atoms: readonly ResettableAtom[]): ResettableAtom {
  return atom(null, (_, set, value: typeof RESET) => {
    atoms.forEach(atom => {
      set(atom, value);
    });
  });
}
