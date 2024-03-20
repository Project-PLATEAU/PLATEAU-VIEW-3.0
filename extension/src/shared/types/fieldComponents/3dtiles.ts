import { TilesetFloodColorFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/3dtiles/EditorTilesetFloodColorField";
import { FillColorConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorFillColorConditionField";
import { FillGradientColorFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorFillColorGradientField";

import { FieldBase } from "./base";
import { ConditionalColorSchemeValue, GradientColorSchemeValue } from "./colorScheme";

export const TILESET_BUILDING_MODEL_COLOR = "TILESET_BUILDING_MODEL_COLOR";
export type TilesetBuildingModelColorField = FieldBase<{
  type: typeof TILESET_BUILDING_MODEL_COLOR;
}>;

export const TILESET_FLOOD_MODEL_COLOR = "TILESET_FLOOD_MODEL_COLOR";
export type TilesetFloodModelColorField = FieldBase<{
  type: typeof TILESET_FLOOD_MODEL_COLOR;
}>;

export const TILESET_FLOOD_COLOR_FIELD = "TILESET_FLOOD_COLOR_FIELD";
export type TilesetFloodColorField = FieldBase<{
  type: typeof TILESET_FLOOD_COLOR_FIELD;
  preset?: TilesetFloodColorFieldPreset;
}>;

export const TILESET_FILL_COLOR_CONDITION_FIELD = "TILESET_FILL_COLOR_CONDITION_FIELD";
export type TilesetFillColorConditionField = FieldBase<{
  type: typeof TILESET_FILL_COLOR_CONDITION_FIELD;
  value?: ConditionalColorSchemeValue;
  preset?: FillColorConditionFieldPreset;
}>;

export const TILESET_FILL_COLOR_GRADIENT_FIELD = "TILESET_FILL_COLOR_GRADIENT_FIELD";
export type TilesetFillGradientColorField = FieldBase<{
  type: typeof TILESET_FILL_COLOR_GRADIENT_FIELD;
  value?: GradientColorSchemeValue;
  preset?: FillGradientColorFieldPreset;
}>;

export const TILESET_CLIPPING = "TILESET_CLIPPING";
export type TilesetClippingField = FieldBase<{
  type: typeof TILESET_CLIPPING;
  value: {
    enable: boolean;
    visible: boolean;
    allowEnterGround: boolean;
    direction: "inside" | "outside";
  };
}>;

export const TILESET_DRAW_CLIPPING = "TILESET_DRAW_CLIPPING";
export type TilesetDrawClippingField = FieldBase<{
  type: typeof TILESET_DRAW_CLIPPING;
  value: {
    enabled?: boolean;
    visible?: boolean;
    direction?: "inside" | "outside";
    drawGeometryCoordinates?: [lng: number, lat: number][];
    top?: number;
    bottom?: number;
  };
}>;

export const TILESET_BUILDING_MODEL_FILTER = "TILESET_BUILDING_MODEL_FILTER";
export type TilesetBuildingModelFilterField = FieldBase<{
  type: typeof TILESET_BUILDING_MODEL_FILTER;
  value: {
    filters: Record<
      string,
      {
        value: [min: number, max: number];
        range: [min: number, max: number];
        accessor: string | undefined;
        defaultValue?: number;
      }
    >;
  };
}>;

export const TILESET_FLOOD_MODEL_FILTER = "TILESET_FLOOD_MODEL_FILTER";
export type TilesetFloodModelFilterField = FieldBase<{
  type: typeof TILESET_FLOOD_MODEL_FILTER;
  value: {
    filters: Record<
      string,
      {
        value: [min: number, max: number];
        range: [min: number, max: number];
        accessor: string | undefined;
        defaultValue?: number;
      }
    >;
  };
}>;

export const TILESET_WIREFRAME = "TILESET_WIREFRAME";
export type TilesetWireframeField = FieldBase<{
  type: typeof TILESET_WIREFRAME;
  value?: {
    wireframe?: boolean;
  };
}>;

export const TILESET_DISABLE_DEFAULT_MATERIAL = "TILESET_DISABLE_DEFAULT_MATERIAL";
export type TileSetDefaultMaterialField = FieldBase<{
  type: typeof TILESET_DISABLE_DEFAULT_MATERIAL;
}>;

export type TilesetFields =
  | TilesetBuildingModelColorField
  | TilesetFloodModelColorField
  | TilesetFillColorConditionField
  | TilesetFillGradientColorField
  | TilesetFloodColorField
  | TilesetClippingField
  | TilesetDrawClippingField
  | TilesetBuildingModelFilterField
  | TilesetFloodModelFilterField
  | TilesetWireframeField
  | TileSetDefaultMaterialField;
