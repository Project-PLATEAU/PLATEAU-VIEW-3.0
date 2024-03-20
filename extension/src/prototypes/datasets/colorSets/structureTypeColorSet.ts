import chroma from "chroma-js";

import { atomsWithQualitativeColorSet } from "../atomsWithQualitativeColorSet";

export const STRUCTURE_TYPE_COLORS = [
  { value: "木造・土蔵造", color: chroma.rgb(178, 180, 140).hex(), name: "木造・土蔵造" },
  {
    value: "鉄骨鉄筋コンクリート造",
    color: chroma.rgb(229, 225, 64).hex(),
    name: "鉄骨鉄筋コンクリート造",
  },
  {
    value: "鉄筋コンクリート造",
    color: chroma.rgb(234, 164, 37).hex(),
    name: "鉄筋コンクリート造",
  },
  { value: "鉄骨造", color: chroma.rgb(153, 99, 50).hex(), name: "鉄骨造" },
  { value: "軽量鉄骨造", color: chroma.rgb(160, 79, 146).hex(), name: "軽量鉄骨造" },
  {
    value: "レンガ造・コンクリートブロック造・石造",
    color: chroma.rgb(119, 23, 28).hex(),
    name: "レンガ造・コンクリートブロック造・石造",
  },
  { value: "非木造", color: chroma.rgb(137, 182, 220).hex(), name: "非木造" },
  {
    value: "不明",
    color: chroma.rgb(34, 34, 34).hex(),
    name: "不明",
  },
];

export const structureTypeColorSet = (id: string, name: string) =>
  atomsWithQualitativeColorSet({
    id: `${id}-structure_type`,
    name,
    colors: STRUCTURE_TYPE_COLORS,
  });
