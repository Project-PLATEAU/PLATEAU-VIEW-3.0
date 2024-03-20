import { atom, type PrimitiveAtom } from "jotai";
import { splitAtom } from "jotai/utils";

import { sharedStoreAtomWrapper, storageStoreAtomWrapper } from "../../shared/sharedAtoms";
import { type SplitAtom } from "../type-helpers";

export interface QualitativeColor {
  id?: string;
  value: string | number;
  color: string;
  name: string;
  strokeColor?: string;
}

export interface QualitativeColorSet {
  id?: string;
  type: "qualitative";
  name: string;
  colorsAtom: PrimitiveAtom<QualitativeColor[]>;
  colorAtomsAtom: SplitAtom<QualitativeColor>;
  defaultColors: QualitativeColor[];
}

export interface QualitativeColorSetOptions {
  id?: string;
  name: string;
  colors: readonly QualitativeColor[];
}

export function atomsWithQualitativeColorSet({
  id,
  name,
  colors,
}: QualitativeColorSetOptions): QualitativeColorSet {
  const shareId = `COLOR_SET_${id || name}`;
  const colorsAtom = sharedStoreAtomWrapper(
    shareId,
    storageStoreAtomWrapper(shareId, atom([...colors]), true),
    { shouldInitialize: true },
  );
  const colorAtomsAtom = splitAtom(colorsAtom);

  const defaultColors = [...colors];

  return {
    id,
    type: "qualitative",
    name,
    colorsAtom,
    colorAtomsAtom,
    defaultColors,
  };
}
