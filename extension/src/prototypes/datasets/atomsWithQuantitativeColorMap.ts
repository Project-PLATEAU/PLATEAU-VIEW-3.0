import { WritableAtom, type PrimitiveAtom, SetStateAction } from "jotai";

import { ColorMapType, type ColorMap } from "../color-maps";

export interface QuantitativeColorMap {
  type: "quantitative";
  name: string;
  colorMapAtom: WritableAtom<ColorMap<ColorMapType>, [SetStateAction<ColorMap>], void>;
  colorRangeAtom: PrimitiveAtom<number[]>;
  valueRangeAtom: PrimitiveAtom<number[]>;
}

export interface QuantitativeColorSetOptions {
  name: string;
  colorMap?: ColorMap;
  colorRange?: number[];
  valueRange?: number[];
}
