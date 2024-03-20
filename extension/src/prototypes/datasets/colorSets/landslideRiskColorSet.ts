import chroma from "chroma-js";

import { atomsWithQualitativeColorSet } from "../atomsWithQualitativeColorSet";

import { LANDSLIDE_RISK_TYPE_CODES } from "./constants";

export const LANDSLIDE_RISK_COLORS = [
  {
    value: LANDSLIDE_RISK_TYPE_CODES[0],
    color: chroma.rgb(255, 183, 76).hex(),
    name: "地すべり: 警戒区域",
  },
  {
    value: LANDSLIDE_RISK_TYPE_CODES[1],
    color: chroma.rgb(202, 76, 149).hex(),
    name: "地すべり: 特別警戒区域",
  },
];

export const landslideRiskColorSet = (id: string, name: string) =>
  atomsWithQualitativeColorSet({
    id: `${id}-landslide_risk`,
    name,
    colors: LANDSLIDE_RISK_COLORS,
  });
