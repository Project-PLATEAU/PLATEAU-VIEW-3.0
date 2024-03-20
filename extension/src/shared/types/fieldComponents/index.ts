import { TilesetFields } from "./3dtiles";
import { GeneralFields } from "./general";
import { PointFields } from "./point";
import { PolygonFields } from "./polygon";
import { PolylineFields } from "./polyline";

export type ComponentBase =
  | GeneralFields
  | PointFields
  | PolygonFields
  | PolylineFields
  | TilesetFields;

export type Component<T extends ComponentBase["type"] = ComponentBase["type"]> = {
  [K in T]: Extract<ComponentBase, { type: K }>;
}[T];
