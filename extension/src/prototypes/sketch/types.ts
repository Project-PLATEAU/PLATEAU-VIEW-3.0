import { type Feature, type MultiPolygon, type Polygon } from "geojson";

export const SKETCH_OBJECT = "SKETCH_OBJECT";

export type SketchGeometryType = "circle" | "rectangle" | "polygon";

export function isSketchGeometryType(value: unknown): value is SketchGeometryType {
  return value === "circle" || value === "rectangle" || value === "polygon";
}

export interface SketchFeatureProperties {
  id: string;
  type?: SketchGeometryType;
  positions?: Array<[number, number, number]>;
  extrudedHeight?: number;
}

export type SketchFeature = Feature<Polygon | MultiPolygon, SketchFeatureProperties>;

declare module "../screen-space-selection" {
  interface ScreenSpaceSelectionOverrides {
    [SKETCH_OBJECT]: string;
  }
}
