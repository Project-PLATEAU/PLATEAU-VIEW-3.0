import { omit } from "lodash-es";

import attributesData from "./attributes.txt?raw";
import type { FldInfo, Properties } from "./types";
import { getPropertyAttributeValue, makePropertyName, makePropertyValue } from "./utils";

export type AttributeValue = { featureType?: string; description?: string; dataType?: string };

export const attributesMap = new Map<string, AttributeValue | undefined>();

attributesData
  .split("\n")
  .map(l => l.split(",{"))
  .forEach(l => {
    attributesMap.set(l[0], JSON.parse("{" + l[1]));
  });

export const getAttributeLabel = (key: string) => attributesMap?.get(key);

export function getRootFields(properties: Properties, _dataType?: string, _fld?: FldInfo): any {
  const featureType = properties["feature_type"];
  const overriddenRootPropertyDefinitions = {
    "分類 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:class",
    "延床面積 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:totalFloorArea",
    "都市計画区域 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:urbanPlanType",
    "区域区分 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:areaClassificationType",
    "地域地区 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:districtsAndZonesType",
    "土地利用区分 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:landUseType",
    "調査年 ※大規模集客施設": "uro:LargeCustomerFacilityAttribute_uro:surveyYear",
    LOD: "_lod",
    ...veg(properties),
    ...tran(properties),
  };
  const baseRootProperties = Object.fromEntries(
    Object.entries(
      omit(properties, [...Object.values(overriddenRootPropertyDefinitions), "attributes"]),
    ).map(([k, v]) => {
      if (k.startsWith("_")) return [k, undefined];
      if (typeof v !== "string" && typeof v !== "number") return [k, undefined];
      const key = `${featureType}_${k}`;
      const attrVal = getPropertyAttributeValue(key);
      const value: string | number | undefined = attrVal ? makePropertyValue(attrVal, v) : v;
      return [makePropertyName(key, k, attrVal), value];
    }),
  );
  const overriddenRootProperties = Object.fromEntries(
    Object.entries(overriddenRootPropertyDefinitions).map(([k, v]) => [k, properties[v]]),
  );
  return filterObjects({
    ...baseRootProperties,
    ...overriddenRootProperties,
  });
}

const tran = (properties: Record<string, any>) => {
  const featureType = properties.feature_type;
  if ("tran:TrafficArea" === featureType) {
    return {
      ["機能 ※交通領域"]: "tran:function",
    };
  }
  if ("tran:AuxiliaryTrafficArea" === featureType) {
    return {
      ["機能 ※交通補助領域"]: "tran:function",
    };
  }

  return {};
};

const veg = (properties: Record<string, any>) => {
  const featureType = properties.feature_type;
  if ("veg:PlantCover" === featureType) {
    return {
      ["分類 ※植被"]: "tran:function",
    };
  }

  return {};
};

function filterObjects(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).filter(
      e => typeof e[1] !== "undefined" && (typeof e[1] !== "string" || e[1]),
    ),
  );
}

// const dataTypeJa: Record<string, string> = {
//   fld: "洪水",
//   tnm: "津波",
//   htd: "高潮",
//   ifld: "内水",
// };
