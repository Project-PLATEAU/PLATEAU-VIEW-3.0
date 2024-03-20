import { ClassificationTypeFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorClassificationTypeField";
import { FillColorConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorFillColorConditionField";
import { FillColorValueFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorFillColorValueField";
import { HeightReferenceFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorHeightReferenceField";
import { VisibilityConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorVisibilityConditionField";
import { VisibilityFilterFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorVisibilityFilterField";

import { FieldBase } from "./base";
import { ConditionalColorSchemeValue, ValueColorSchemeValue } from "./colorScheme";

export const POLYLINE_STROKE_WEIGHT_FIELD = "POLYLINE_STROKE_WEIGHT_FIELD";
export type PolylineStrokeWeightField = FieldBase<{
  type: typeof POLYLINE_STROKE_WEIGHT_FIELD;
  preset?: {
    defaultValue?: number;
  };
}>;

export const POLYLINE_FILL_COLOR_VALUE_FIELD = "POLYLINE_FILL_COLOR_VALUE_FIELD";
export type PolylineFillColorValueField = FieldBase<{
  type: typeof POLYLINE_FILL_COLOR_VALUE_FIELD;
  value?: ValueColorSchemeValue;
  preset?: FillColorValueFieldPreset;
}>;

export const POLYLINE_FILL_COLOR_CONDITION_FIELD = "POLYLINE_FILL_COLOR_CONDITION_FIELD";
export type PolylineFillColorConditionField = FieldBase<{
  type: typeof POLYLINE_FILL_COLOR_CONDITION_FIELD;
  value?: ConditionalColorSchemeValue;
  preset?: FillColorConditionFieldPreset;
}>;

export const POLYLINE_VISIBILITY_CONDITION_FIELD = "POLYLINE_VISIBILITY_CONDITION_FIELD";
export type PolylineVisibilityConditionField = FieldBase<{
  type: typeof POLYLINE_VISIBILITY_CONDITION_FIELD;
  preset?: VisibilityConditionFieldPreset;
}>;

export const POLYLINE_VISIBILITY_FILTER_FIELD = "POLYLINE_VISIBILITY_FILTER_FIELD";
export type PolylineVisibilityFilterField = FieldBase<{
  type: typeof POLYLINE_VISIBILITY_FILTER_FIELD;
  value?: string;
  preset?: VisibilityFilterFieldPreset;
}>;

export const POLYLINE_HEIGHT_REFERENCE_FIELD = "POLYLINE_HEIGHT_REFERENCE_FIELD";
export type PolylineHeightReferenceField = FieldBase<{
  type: typeof POLYLINE_HEIGHT_REFERENCE_FIELD;
  preset?: HeightReferenceFieldPreset;
}>;

export const POLYLINE_CLASSIFICATION_TYPE_FIELD = "POLYLINE_CLASSIFICATION_TYPE_FIELD";
export type PolylineClassificationTypeField = FieldBase<{
  type: typeof POLYLINE_CLASSIFICATION_TYPE_FIELD;
  preset?: ClassificationTypeFieldPreset;
}>;

export type PolylineFields =
  | PolylineStrokeWeightField
  | PolylineFillColorConditionField
  | PolylineFillColorValueField
  | PolylineVisibilityConditionField
  | PolylineVisibilityFilterField
  | PolylineHeightReferenceField
  | PolylineClassificationTypeField;
