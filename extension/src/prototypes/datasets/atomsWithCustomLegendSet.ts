import { atom, type PrimitiveAtom } from "jotai";
import { splitAtom } from "jotai/utils";

import { type SplitAtom } from "../type-helpers";

export type CustomLegendType = "square" | "circle" | "line" | "icon";

export interface CustomLegend {
  title: string;
  type: CustomLegendType;
  url: string;
  color?: string;
  strokeColor?: string;
}

export interface CustomLegendSet {
  type: "customLegend";
  name: string;
  customLegendsAtom: PrimitiveAtom<CustomLegend[]>;
  customLegendAtomsAtom: SplitAtom<CustomLegend>;
}

export interface CustomLegendSetOptions {
  name: string;
  customLegends: readonly CustomLegend[];
}

export function atomsWithCustomLegendSet({
  name,
  customLegends,
}: CustomLegendSetOptions): CustomLegendSet {
  const customLegendsAtom = atom([...customLegends]);
  const customLegendAtomsAtom = splitAtom(customLegendsAtom);
  return {
    type: "customLegend",
    name,
    customLegendsAtom,
    customLegendAtomsAtom,
  };
}
