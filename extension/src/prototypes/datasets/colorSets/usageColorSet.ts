import chroma from "chroma-js";

import { atomsWithQualitativeColorSet } from "../atomsWithQualitativeColorSet";

export const USAGE_COLORS = [
  { value: "業務施設", color: chroma.rgb(255, 127, 80).hex(), name: "業務施設" },
  { value: "商業施設", color: chroma.rgb(255, 69, 0).hex(), name: "商業施設" },
  { value: "宿泊施設", color: chroma.rgb(255, 255, 0).hex(), name: "宿泊施設" },
  { value: "商業系複合施設", color: chroma.rgb(255, 69, 0).hex(), name: "商業系複合施設" },
  { value: "住宅", color: chroma.rgb(50, 205, 50).hex(), name: "住宅" },
  { value: "共同住宅", color: chroma.rgb(0, 255, 127).hex(), name: "共同住宅" },
  { value: "店舗等併用住宅", color: chroma.rgb(0, 255, 255).hex(), name: "店舗等併用住宅" },
  {
    value: "店舗等併用共同住宅",
    color: chroma.rgb(0, 255, 255).hex(),
    name: "店舗等併用共同住宅",
  },
  {
    value: "作業所併用住宅",
    color: chroma.rgb(0, 255, 255).hex(),
    name: "作業所併用住宅",
  },
  {
    value: "官公庁施設",
    color: chroma.rgb(65, 105, 225).hex(),
    name: "官公庁施設",
  },
  {
    value: "文教厚生施設",
    color: chroma.rgb(46, 30, 244).hex(),
    name: "文教厚生施設",
  },
  {
    value: "運輸倉庫施設",
    color: chroma.rgb(147, 112, 219).hex(),
    name: "運輸倉庫施設",
  },
  {
    value: "工場",
    color: chroma.rgb(135, 206, 250).hex(),
    name: "工場",
  },
  {
    value: "農林漁業用施設",
    color: chroma.rgb(0, 128, 0).hex(),
    name: "農林漁業用施設",
  },
  {
    value: "供給処理施設",
    color: chroma.rgb(123, 71, 32).hex(),
    name: "供給処理施設",
  },
  {
    value: "防衛施設",
    color: chroma.rgb(178, 34, 34).hex(),
    name: "防衛施設",
  },
  {
    value: "その他",
    color: chroma.rgb(216, 191, 216).hex(),
    name: "その他",
  },
  {
    value: "不明",
    color: chroma.rgb(230, 230, 250).hex(),
    name: "不明",
  },
];

export const usageColorSet = (id: string, name: string) =>
  atomsWithQualitativeColorSet({
    id: `${id}-usage`,
    name,
    colors: USAGE_COLORS,
  });
