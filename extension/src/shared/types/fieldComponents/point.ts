import { FillColorConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorFillColorConditionField";
import { FillGradientColorFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorFillColorGradientField";
import { FillColorValueFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorFillColorValueField";
import { HeightReferenceFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorHeightReferenceField";
import { VisibilityConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorVisibilityConditionField";
import { VisibilityFilterFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/common/EditorVisibilityFilterField";
import { PointConvertFromCSVFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/point/EditorPointConvertFromCSVField";
import { PointUseImageConditionFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/point/EditorPointUseImageConditionField";
import { PointUseImageValueFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/point/EditorPointUseImageValueField";
import { PointUseLabelFieldPreset } from "../../../editor/containers/common/fieldComponentEditor/fields/point/EditorPointUseLabelField";

import { FieldBase } from "./base";
import {
  ConditionalColorSchemeValue,
  GradientColorSchemeValue,
  ValueColorSchemeValue,
} from "./colorScheme";
import { ConditionalImageSchemeValue, ValueImageSchemeValue } from "./imageScheme";

export const POINT_STYLE_FIELD = "POINT_STYLE_FIELD";
export type PointStyleField = FieldBase<{
  type: typeof POINT_STYLE_FIELD;
  preset?: {
    style?: "image" | "point";
  };
}>;

export const POINT_SIZE_FIELD = "POINT_SIZE_FIELD";
export type PointSizeField = FieldBase<{
  type: typeof POINT_SIZE_FIELD;
  value?: number;
  preset?: {
    defaultValue?: number;
  };
}>;

export const POINT_STROKE_FIELD = "POINT_STROKE_FIELD";
export type PointStrokeField = FieldBase<{
  type: typeof POINT_STROKE_FIELD;
  preset?: {
    color?: string;
    width?: number;
  };
}>;

export const POINT_FILL_COLOR_VALUE_FIELD = "POINT_FILL_COLOR_VALUE_FIELD";
export type PointFillColorValueField = FieldBase<{
  type: typeof POINT_FILL_COLOR_VALUE_FIELD;
  value?: ValueColorSchemeValue;
  preset?: FillColorValueFieldPreset;
}>;

export const POINT_FILL_COLOR_CONDITION_FIELD = "POINT_FILL_COLOR_CONDITION_FIELD";
export type PointFillColorConditionField = FieldBase<{
  type: typeof POINT_FILL_COLOR_CONDITION_FIELD;
  value?: ConditionalColorSchemeValue;
  preset?: FillColorConditionFieldPreset;
}>;

export const POINT_FILL_COLOR_GRADIENT_FIELD = "POINT_FILL_COLOR_GRADIENT_FIELD";
export type PointFillGradientColorField = FieldBase<{
  type: typeof POINT_FILL_COLOR_GRADIENT_FIELD;
  value?: GradientColorSchemeValue;
  preset?: FillGradientColorFieldPreset;
}>;

export const POINT_VISIBILITY_CONDITION_FIELD = "POINT_VISIBILITY_CONDITION_FIELD";
export type PointVisibilityConditionField = FieldBase<{
  type: typeof POINT_VISIBILITY_CONDITION_FIELD;
  preset?: VisibilityConditionFieldPreset;
}>;

export const POINT_VISIBILITY_FILTER_FIELD = "POINT_VISIBILITY_FILTER_FIELD";
export type PointVisibilityFilterField = FieldBase<{
  type: typeof POINT_VISIBILITY_FILTER_FIELD;
  value?: string;
  preset?: VisibilityFilterFieldPreset;
}>;

export const POINT_USE_IMAGE_VALUE_FIELD = "POINT_USE_IMAGE_VALUE_FIELD";
export type PointUseImageValueField = FieldBase<{
  type: typeof POINT_USE_IMAGE_VALUE_FIELD;
  value?: ValueImageSchemeValue;
  preset?: PointUseImageValueFieldPreset;
}>;

export const POINT_USE_IMAGE_CONDITION_FIELD = "POINT_USE_IMAGE_CONDITION_FIELD";
export type PointUseImageConditionField = FieldBase<{
  type: typeof POINT_USE_IMAGE_CONDITION_FIELD;
  value?: ConditionalImageSchemeValue;
  preset?: PointUseImageConditionFieldPreset;
}>;

export const POINT_IMAGE_SIZE_FIELD = "POINT_IMAGE_SIZE_FIELD";
export type PointImageSizeField = FieldBase<{
  type: typeof POINT_IMAGE_SIZE_FIELD;
  preset?: {
    defaultValue?: number;
    enableSizeInMeters?: boolean;
  };
}>;

export const POINT_USE_3D_MODEL = "POINT_USE_3D_MODEL";
export type PointUse3DModelField = FieldBase<{
  type: typeof POINT_USE_3D_MODEL;
  preset?: {
    url?: string;
    size?: number;
  };
}>;

export const POINT_CONVERT_FROM_CSV = "POINT_CONVERT_FROM_CSV";
export type PointConvertFromCSVField = FieldBase<{
  type: typeof POINT_CONVERT_FROM_CSV;
  preset?: PointConvertFromCSVFieldPreset;
}>;

export const POINT_USE_LABEL_FIELD = "POINT_USE_LABEL_FIELD";
export type PointUseLabelField = FieldBase<{
  type: typeof POINT_USE_LABEL_FIELD;
  preset?: PointUseLabelFieldPreset;
}>;

export const POINT_HEIGHT_REFERENCE_FIELD = "POINT_HEIGHT_REFERENCE_FIELD";
export type PointHeightReferenceField = FieldBase<{
  type: typeof POINT_HEIGHT_REFERENCE_FIELD;
  preset?: HeightReferenceFieldPreset;
}>;

export type PointFields =
  | PointStyleField
  | PointSizeField
  | PointStrokeField
  | PointFillColorValueField
  | PointFillColorConditionField
  | PointFillGradientColorField
  | PointVisibilityConditionField
  | PointVisibilityFilterField
  | PointUseImageValueField
  | PointUseImageConditionField
  | PointImageSizeField
  | PointUse3DModelField
  | PointConvertFromCSVField
  | PointUseLabelField
  | PointHeightReferenceField;
