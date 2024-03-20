import chroma from "chroma-js";

import { atomsWithQualitativeColorSet } from "../atomsWithQualitativeColorSet";

import { LANDSLIDE_RISK_TYPE_CODES } from "./constants";

export const MUDFLOW_RISK_COLORS = [
  {
    value: LANDSLIDE_RISK_TYPE_CODES[0],
    color: chroma.rgb(237, 216, 111).hex(),
    name: "土石流: 警戒区域",
  },
  {
    value: LANDSLIDE_RISK_TYPE_CODES[1],
    color: chroma.rgb(192, 76, 99).hex(),
    name: "土石流: 特別警戒区域",
  },
];

export const mudflowRiskColorSet = (id: string, name: string) =>
  atomsWithQualitativeColorSet({
    id: `${id}-mudflow_risk`,
    name,
    colors: MUDFLOW_RISK_COLORS,
  });
