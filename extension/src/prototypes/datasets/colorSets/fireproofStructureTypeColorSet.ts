import chroma from "chroma-js";

import { atomsWithQualitativeColorSet } from "../atomsWithQualitativeColorSet";

export const FIREPROOF_STRUCTURE_TYPE_COLORS = [
  { value: "耐火", color: chroma.rgb(92, 92, 94).hex(), name: "耐火" },
  {
    value: "準耐火造",
    color: chroma.rgb(140, 155, 177).hex(),
    name: "準耐火造",
  },
  {
    value: "その他",
    color: chroma.rgb(250, 131, 158).hex(),
    name: "その他",
  },
  { value: "不明", color: chroma.rgb(120, 194, 243).hex(), name: "不明" },
];

export const fireproofStructureTypeColorSet = (id: string, name: string) =>
  atomsWithQualitativeColorSet({
    id: `${id}-fireproof_structure_type`,
    name,
    colors: FIREPROOF_STRUCTURE_TYPE_COLORS,
  });
