import { DatasetFormat } from "../graphql/types/catalog";
import { DataType } from "../reearth/types/layer";

export const REEARTH_DATA_FORMATS: Record<DatasetFormat, DataType> = {
  [DatasetFormat.Cesium3Dtiles]: "3dtiles",
  [DatasetFormat.Csv]: "csv",
  [DatasetFormat.Czml]: "czml",
  [DatasetFormat.Geojson]: "geojson",
  [DatasetFormat.Gltf]: "gltf",
  [DatasetFormat.GtfsRealtime]: "gtfs",
  [DatasetFormat.Mvt]: "mvt",
  [DatasetFormat.Tiles]: "tiles",
  [DatasetFormat.Tms]: "tms",
  [DatasetFormat.Wms]: "wms",
};

export const BUILDING_MODEL_FILTER_RANGE: Record<string, [min: number, max: number]> = {
  // Height
  ["計測高さ"]: [0, 200],
  // Aboveground floor
  ["地上階数"]: [0, 100],
  // Basement floor
  ["地下階数"]: [0, 5],
  // Building age
  ["建築年"]: [1850, new Date().getFullYear()],
};

export const FEATURE_PROPERTIES_CONFIG = [
  {
    property: "attributes",
    name: "全ての属性",
  },
];
