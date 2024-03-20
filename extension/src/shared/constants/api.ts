import { CameraPosition } from "../reearth/types";

// default settings
export let PLATEAU_API_URL: string | undefined;
export const setPlateauApiUrl = (url: string) => {
  PLATEAU_API_URL = url;
};

export let PROJECT_ID: string | undefined;
export const setProjectId = (id: string) => {
  PROJECT_ID = id;
};

export let GEO_API_URL: string | undefined;
export const setGeoApiUrl = (url: string) => {
  GEO_API_URL = url;
};

export let GSI_TILE_URL: string | undefined;
export const setGISTileURL = (url: string) => {
  GSI_TILE_URL = url;
};

export let GOOGLE_STREET_VIEW_API_KEY: string | undefined;
export const setGoogleStreetViewAPIKey = (key: string) => {
  GOOGLE_STREET_VIEW_API_KEY = key;
};

// custom settings
export let CITY_NAME: string | undefined;
export const setCityName = (name: string) => {
  CITY_NAME = name;
};

export let PRIMARY_COLOR: string | undefined;
export const setPrimaryColor = (color: string) => {
  PRIMARY_COLOR = color;
};

export let LOGO: string | undefined;
export const setLogo = (url: string) => {
  LOGO = url;
};

export let SITE_URL: string | undefined;
export const setSiteURL = (url?: string) => {
  SITE_URL = url ?? "https://www.mlit.go.jp/plateau/";
};

export let INITIAL_PEDESTRIAN_COORDINATES: CameraPosition | undefined;
export const setInitialPededstrianCoordinates = (camera?: CameraPosition) => {
  INITIAL_PEDESTRIAN_COORDINATES = camera;
};

export let PLATEAU_GEOJSON_URL: string | undefined;
export const setPlateauGeojsonUrl = (url: string) => {
  PLATEAU_GEOJSON_URL = url;
};
