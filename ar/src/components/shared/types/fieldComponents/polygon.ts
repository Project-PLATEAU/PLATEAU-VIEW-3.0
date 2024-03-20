// import { ClassificationTypeFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorClassificationTypeField";
// import { FillColorConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorFillColorConditionField";
// import { FillColorValueFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorFillColorValueField";
// import { HeightReferenceFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorHeightReferenceField";
// import { VisibilityConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorVisibilityConditionField";
// import { VisibilityFilterFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorVisibilityFilterField";

import { FieldBase } from "./base";
import { ConditionalColorSchemeValue, ValueColorSchemeValue } from "./colorScheme";

export const POLYGON_STROKE_COLOR_FIELD = "POLYGON_STROKE_COLOR_FIELD";
export type PolygonStrokeColorField = FieldBase<{
  type: typeof POLYGON_STROKE_COLOR_FIELD;
  preset?: {
    defaultValue?: string;
  };
}>;

export const POLYGON_STROKE_WEIGHT_FIELD = "POLYGON_STROKE_WEIGHT_FIELD";
export type PolygonStrokeWeightField = FieldBase<{
  type: typeof POLYGON_STROKE_WEIGHT_FIELD;
  preset?: {
    defaultValue?: number;
  };
}>;

export const POLYGON_VISIBILITY_CONDITION_FIELD = "POLYGON_VISIBILITY_CONDITION_FIELD";
export type PolygonVisibilityConditionField = FieldBase<{
  type: typeof POLYGON_VISIBILITY_CONDITION_FIELD;
  // preset?: VisibilityConditionFieldPreset;
}>;

export const POLYGON_FILL_COLOR_VALUE_FIELD = "POLYGON_FILL_COLOR_VALUE_FIELD";
export type PolygonFillColorValueField = FieldBase<{
  type: typeof POLYGON_FILL_COLOR_VALUE_FIELD;
  value?: ValueColorSchemeValue;
  // preset?: FillColorValueFieldPreset;
}>;

export const POLYGON_FILL_COLOR_CONDITION_FIELD = "POLYGON_FILL_COLOR_CONDITION_FIELD";
export type PolygonFillColorConditionField = FieldBase<{
  type: typeof POLYGON_FILL_COLOR_CONDITION_FIELD;
  value?: ConditionalColorSchemeValue;
  // preset?: FillColorConditionFieldPreset;
}>;

export const POLYGON_VISIBILITY_FILTER_FIELD = "POLYGON_VISIBILITY_FILTER_FIELD";
export type PolygonVisibilityFilterField = FieldBase<{
  type: typeof POLYGON_VISIBILITY_FILTER_FIELD;
  value?: string;
  // preset?: VisibilityFilterFieldPreset;
}>;

export const POLYGON_HEIGHT_REFERENCE_FIELD = "POLYGON_HEIGHT_REFERENCE_FIELD";
export type PolygonHeightReferenceField = FieldBase<{
  type: typeof POLYGON_HEIGHT_REFERENCE_FIELD;
  // preset?: HeightReferenceFieldPreset;
}>;

export const POLYGON_CLASSIFICATION_TYPE_FIELD = "POLYGON_CLASSIFICATION_TYPE_FIELD";
export type PolygonClassificationTypeField = FieldBase<{
  type: typeof POLYGON_CLASSIFICATION_TYPE_FIELD;
  // preset?: ClassificationTypeFieldPreset;
}>;

export type PolygonFields =
  | PolygonStrokeColorField
  | PolygonStrokeWeightField
  | PolygonFillColorConditionField
  | PolygonFillColorValueField
  | PolygonVisibilityConditionField
  | PolygonVisibilityFilterField
  | PolygonHeightReferenceField
  | PolygonClassificationTypeField;
