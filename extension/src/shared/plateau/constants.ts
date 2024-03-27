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

export const FEATURE_PROPERTIES_CONFIG = [
  {
    property: "attributes",
    name: "全ての属性",
  },
];

export const BUILDING_FEATURE_TYPE = "bldg:Building";

// Some area codes are changed due to some goverment reason, but digital data isn't updated yet.
// Then we can't get the actual area code for each ward from API.
// But we can get city's code, so we need to show the data for ward as city.
export const CITY_CODES_FOR_BUILDING_MODEL = ["22130"];
