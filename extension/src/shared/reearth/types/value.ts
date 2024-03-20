import { CameraPosition } from "./camera";

export type LngLat = {
  lat: number;
  lng: number;
};

export type LngLatHeight = {
  lat: number;
  lng: number;
  height: number;
};

export type XYZ = {
  x: number;
  y: number;
  z: number;
  radius?: number;
};

export type Typography = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify" | "justify_all";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type Bound = {
  east: number;
  north: number;
  south: number;
  west: number;
};

export type ColorTuple = [number, number, number];
export type LUT = readonly ColorTuple[];

export type Coordinates = LngLatHeight[];

export type Polygon = LngLatHeight[][];

export type Rect = {
  west: number;
  south: number;
  east: number;
  north: number;
};

// Ideal for plugin developers, but it's hard to implement it with Cesium
export type Plane = {
  location: LngLatHeight;
  width: number;
  height: number;
  length: number;
  heading: number;
  pitch: number;
};

// Familiar with Cesium
export type EXPERIMENTAL_clipping = {
  useBuiltinBox?: boolean;
  allowEnterGround?: boolean;
  planes?: {
    normal: {
      x: number;
      y: number;
      z: number;
    };
    distance: number;
  }[];
  visible?: boolean;
  // for compat
  location?: LngLatHeight;
  coordinates?: number[];
  /**
   * x-axis
   */
  width?: number;
  /**
   * y-axis
   */
  length?: number;
  /**
   * z-axis
   */
  height?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
  direction?: "inside" | "outside";
  disabledSelection?: boolean;
  // draw
  draw?: {
    enabled?: boolean;
    surfacePoints?: LngLat[];
    direction?: "inside" | "outside";
    top?: number;
    bottom?: number;
    visible?: boolean;
    style?: {
      fill?: boolean;
      fillColor?: string;
      stroke?: boolean;
      strokeColor?: string;
      strokeWidth?: number;
    };
  };
};

// Don't forget adding a new field to valueTypeMapper also!
export type ValueTypes = {
  string: string;
  number: number;
  bool: boolean;
  latlng: LngLat;
  latlngheight: LngLatHeight;
  url: string;
  camera: CameraPosition;
  typography: Typography;
  coordinates: Coordinates;
  polygon: Polygon;
  rect: Rect;
  ref: string;
  tiletype: string;
};

export type ValueType = keyof ValueTypes;

export type ClassificationType = "both" | "terrain" | "3dtiles";
