import { merge } from "lodash-es";
import { useMemo } from "react";

import { isNotNullish } from "../../../prototypes/type-helpers";
import { COLOR_MAPS } from "../../constants";
import { color, defaultConditionalNumber, number, rgba, string, variable } from "../../helpers";
import { useOptionalAtomValue } from "../../hooks";
import { GeneralAppearances } from "../../reearth/layers";
import { ExpressionContainer } from "../../reearth/types/expression";
import { Component } from "../../types/fieldComponents";
import {
  TILESET_CLIPPING,
  TILESET_FILL_COLOR_CONDITION_FIELD,
  TILESET_FILL_COLOR_GRADIENT_FIELD,
} from "../../types/fieldComponents/3dtiles";
import { STYLE_CODE_FIELD } from "../../types/fieldComponents/general";
import {
  POINT_FILL_COLOR_VALUE_FIELD,
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
  POINT_SIZE_FIELD,
  POINT_STYLE_FIELD,
  POINT_VISIBILITY_FILTER_FIELD,
  POINT_USE_IMAGE_VALUE_FIELD,
  POINT_USE_IMAGE_CONDITION_FIELD,
  POINT_IMAGE_SIZE_FIELD,
  POINT_USE_3D_MODEL,
  POINT_VISIBILITY_CONDITION_FIELD,
  POINT_USE_LABEL_FIELD,
  POINT_HEIGHT_REFERENCE_FIELD,
} from "../../types/fieldComponents/point";
import {
  POLYGON_CLASSIFICATION_TYPE_FIELD,
  POLYGON_FILL_COLOR_CONDITION_FIELD,
  POLYGON_FILL_COLOR_VALUE_FIELD,
  POLYGON_HEIGHT_REFERENCE_FIELD,
  POLYGON_STROKE_COLOR_FIELD,
  POLYGON_STROKE_WEIGHT_FIELD,
  POLYGON_VISIBILITY_CONDITION_FIELD,
  POLYGON_VISIBILITY_FILTER_FIELD,
} from "../../types/fieldComponents/polygon";
import {
  POLYLINE_CLASSIFICATION_TYPE_FIELD,
  POLYLINE_FILL_COLOR_CONDITION_FIELD,
  POLYLINE_FILL_COLOR_VALUE_FIELD,
  POLYLINE_HEIGHT_REFERENCE_FIELD,
  POLYLINE_STROKE_WEIGHT_FIELD,
  POLYLINE_VISIBILITY_CONDITION_FIELD,
  POLYLINE_VISIBILITY_FILTER_FIELD,
} from "../../types/fieldComponents/polyline";
import { ComponentAtom } from "../../view-layers/component";
import { useFindComponent } from "../../view-layers/hooks";

import { useClippingBox } from "./useClippingBox";

const DEFAULT_COLOR = "#ffffff";

export const makeSimpleValue = (
  comp:
    | Component<
        | typeof POINT_FILL_COLOR_VALUE_FIELD
        | typeof POLYLINE_FILL_COLOR_VALUE_FIELD
        | typeof POLYGON_FILL_COLOR_VALUE_FIELD
        | typeof POLYGON_STROKE_COLOR_FIELD
      >
    | undefined,
): string | undefined => {
  if (!comp) return;

  switch (comp.type) {
    // Point
    case POINT_FILL_COLOR_VALUE_FIELD:
      return comp.value?.color;
    // Polyline
    case POLYLINE_FILL_COLOR_VALUE_FIELD:
      return comp.value?.color;
    // Polygon
    case POLYGON_FILL_COLOR_VALUE_FIELD:
      return comp.value?.color;
    default:
      return comp.preset?.defaultValue;
  }
};

export const makeConditionalExpression = (
  comp:
    | Component<
        | typeof POINT_FILL_COLOR_CONDITION_FIELD
        | typeof TILESET_FILL_COLOR_CONDITION_FIELD
        | typeof POLYLINE_FILL_COLOR_CONDITION_FIELD
        | typeof POLYGON_FILL_COLOR_CONDITION_FIELD
      >
    | undefined,
): ExpressionContainer | undefined => {
  if (!comp) return;

  const currentRuleId = comp.value?.useDefault
    ? comp.value?.currentRuleId
    : comp.value?.currentRuleId;

  return {
    expression: {
      conditions: [
        // ...(
        //   comp.preset?.rules?.flatMap(rule => {
        //     if (rule.id !== currentRuleId) return;
        //     const overriddenRules = comp.value?.overrideRules.filter(r => r.ruleId === rule.id);
        //     return rule.conditions?.map(cond => {
        //       const overriddenCondition = overriddenRules?.find(r => r.conditionId === cond.id);
        //       const colorValue = overriddenCondition?.color || cond.color;
        //       if (!rule.propertyName || !cond.value || !colorValue) return;
        //       const stringCondition = `${variable(rule.propertyName)} ${cond.operation} ${string(
        //         cond.value,
        //       )}`;
        //       const numberCondition = !isNaN(Number(cond.value))
        //         ? `${defaultConditionalNumber(rule.propertyName)} ${cond.operation} ${number(
        //             Number(cond.value),
        //           )}`
        //         : undefined;
        //       return rule.propertyName && cond.value && colorValue
        //         ? ([numberCondition ? numberCondition : stringCondition, color(colorValue, 1)] as [
        //             string,
        //             string,
        //           ])
        //         : undefined;
        //     });
        //   }) ?? []
        // ).filter(isNotNullish),
        ["true", color(DEFAULT_COLOR, 1)],
      ],
    },
  };
};

export const makeGradientExpression = (
  comp:
    | Component<typeof POINT_FILL_COLOR_GRADIENT_FIELD | typeof TILESET_FILL_COLOR_GRADIENT_FIELD>
    | undefined,
): ExpressionContainer | undefined => {
  if (!comp) return;

  const preset = comp.preset;
  const value = comp.value;
  const currentRuleId = comp.value?.useDefault
    ? comp.value?.currentRuleId
    : comp.value?.currentRuleId;
  // const rule = preset?.rules?.find(r => r.id === currentRuleId);

  const conditions: [string, string][] = [["true", color(DEFAULT_COLOR, 1)]];

  const [minValue, maxValue] = [
    value?.currentMin,
    value?.currentMax,
  ];
  if (minValue === maxValue) {
    return {
      expression: { conditions },
    };
  }

  const colorMap = COLOR_MAPS.find(
    c => c.name === (value?.currentColorMapName),
  );
  // const colorProperty = rule?.propertyName;

  if (!colorMap) return { expression: { conditions } };

  // const distance = 5;
  // for (let i = minValue; i <= maxValue; i += distance) {
  //   const color = colorMap.linear((i - minValue) / (maxValue - minValue));
  //   conditions.unshift([
  //     `${defaultConditionalNumber(colorProperty, minValue - 1)} >= ${number(i)}`,
  //     rgba({ r: color[0] * 255, g: color[1] * 255, b: color[2] * 255, a: 1 }),
  //   ]);
  // }

  return {
    expression: {
      conditions,
    },
  };
};

const makeVisibilityConditionExpression = (
  comp:
    | Component<
        | typeof POINT_VISIBILITY_CONDITION_FIELD
        | typeof POLYLINE_VISIBILITY_CONDITION_FIELD
        | typeof POLYGON_VISIBILITY_CONDITION_FIELD
      >
    | undefined,
): ExpressionContainer | undefined => {
  // const conditions = comp?.preset?.conditions;

  // if (!conditions) return;

  // return {
  //   expression: {
  //     conditions: conditions.reduce(
  //       (res, cond) => {
  //         const isNumber = !isNaN(Number(cond.value));
  //         if (!cond.operation || !cond.value || !cond.propertyName) return res;
  //         res.unshift([
  //           isNumber
  //             ? `${defaultConditionalNumber(cond.propertyName)} ${cond.operation} ${cond.value}`
  //             : `${variable(cond.propertyName)} ${cond.operation} ${string(cond.value)}`,
  //           cond.show ? "true" : "false",
  //         ]);
  //         return res;
  //       },
  //       [["true", "false"]],
  //     ),
  //   },
  // };

  return undefined;
};

const makeVisibilityFilterExpression = (
  comp:
    | Component<
        | typeof POINT_VISIBILITY_FILTER_FIELD
        | typeof POLYLINE_VISIBILITY_FILTER_FIELD
        | typeof POLYGON_VISIBILITY_FILTER_FIELD
      >
    | undefined,
): ExpressionContainer | undefined => {
  // const rule =
  //   comp?.preset?.rules?.find(rule => rule.id === comp.value) ?? comp?.preset?.rules?.[0];
  // const property = rule?.propertyName;

  // if (!rule?.conditions || !property) return;

  // return {
  //   expression: {
  //     conditions: rule.conditions.reduce(
  //       (res, cond) => {
  //         const isNumber = !isNaN(Number(cond.value));
  //         if (!cond.operation || !cond.value) return res;
  //         res.unshift([
  //           isNumber
  //             ? `${defaultConditionalNumber(property)} ${cond.operation} ${cond.value}`
  //             : `${variable(property)} ${cond.operation} ${string(cond.value)}`,
  //           "true",
  //         ]);
  //         return res;
  //       },
  //       [["true", "false"]],
  //     ),
  //   },
  // };

  return undefined;
};

export const makeConditionalImageExpression = (
  comp: Component<typeof POINT_USE_IMAGE_CONDITION_FIELD> | undefined,
): ExpressionContainer | undefined => {
  if (!comp) return;
  const currentRuleId = comp.value?.currentRuleId;
  return {
    expression: {
      conditions: [
        // ...(
        //   comp.preset?.rules?.flatMap(rule => {
        //     if (rule.id !== currentRuleId) return;
        //     const overriddenRules = comp.value?.overrideRules.filter(r => r.ruleId === rule.id);
        //     return rule.conditions?.map(cond => {
        //       const overriddenCondition = overriddenRules?.find(r => r.conditionId === cond.id);
        //       const imageURLValue = overriddenCondition?.imageURL || cond.imageURL;
        //       if (!rule.propertyName || !cond.value || !imageURLValue) return;
        //       const stringCondition = `${variable(rule.propertyName)} ${cond.operation} ${string(
        //         cond.value,
        //       )}`;
        //       const numberCondition = !isNaN(Number(cond.value))
        //         ? `${defaultConditionalNumber(rule.propertyName)} ${cond.operation} ${number(
        //             Number(cond.value),
        //           )}`
        //         : undefined;
        //       return rule.propertyName && cond.value && imageURLValue
        //         ? ([
        //             numberCondition ? `${numberCondition} || ${stringCondition}` : stringCondition,
        //             `"${imageURLValue}"`,
        //           ] as [string, string])
        //         : undefined;
        //     });
        //   }) ?? []
        // ).filter(isNotNullish),
      ],
    },
  };
};

export const makeConditionalImageColorExpression = (
  comp: Component<typeof POINT_USE_IMAGE_CONDITION_FIELD> | undefined,
): ExpressionContainer | undefined => {
  if (!comp) return;
  // const currentRuleId = comp.value?.currentRuleId ?? comp.preset?.rules?.[0].id;
  return {
    expression: {
      conditions: [
        // ...(
        //   comp.preset?.rules?.flatMap(rule => {
        //     if (rule.id !== currentRuleId) return;
        //     const overriddenRules = comp.value?.overrideRules.filter(r => r.ruleId === rule.id);
        //     return rule.conditions?.map(cond => {
        //       const overriddenCondition = overriddenRules?.find(r => r.conditionId === cond.id);
        //       const imageColorValue = overriddenCondition?.imageColor || cond.imageColor;
        //       if (!rule.propertyName || !cond.value || !imageColorValue) return;
        //       const stringCondition = `${variable(rule.propertyName)} ${cond.operation} ${string(
        //         cond.value,
        //       )}`;
        //       const numberCondition = !isNaN(Number(cond.value))
        //         ? `${defaultConditionalNumber(rule.propertyName)} ${cond.operation} ${number(
        //             Number(cond.value),
        //           )}`
        //         : undefined;
        //       return rule.propertyName && cond.value && imageColorValue
        //         ? ([
        //             numberCondition ? `${numberCondition} || ${stringCondition}` : stringCondition,
        //             `color("${imageColorValue}")`,
        //           ] as [string, string])
        //         : undefined;
        //     });
        //   }) ?? []
        // ).filter(isNotNullish),
      ],
    },
  };
};

export const makeLabelTextExpression = (
  comp: Component<typeof POINT_USE_LABEL_FIELD> | undefined,
): ExpressionContainer | string | undefined => {
  if (!comp) return;
  // const textExpression = comp.preset?.textExpression;
  // if (!textExpression?.startsWith("=")) return textExpression;
  return {
    expression: {
      conditions: [],
    },
  };
};

export const useEvaluateGeneralAppearance = ({
  componentAtoms,
}: {
  componentAtoms: ComponentAtom[] | undefined;
}) => {
  // Point
  const pointStyle = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_STYLE_FIELD),
  );
  const pointColor = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_FILL_COLOR_VALUE_FIELD),
  );
  const pointSize = useOptionalAtomValue(useFindComponent(componentAtoms ?? [], POINT_SIZE_FIELD));
  const pointFillColorCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_FILL_COLOR_CONDITION_FIELD),
  );
  const pointFillGradientColor = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_FILL_COLOR_GRADIENT_FIELD),
  );
  const pointVisibilityCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_VISIBILITY_CONDITION_FIELD),
  );
  const pointVisibilityFilter = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_VISIBILITY_FILTER_FIELD),
  );
  const pointImageValue = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_USE_IMAGE_VALUE_FIELD),
  );
  const pointImageCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_USE_IMAGE_CONDITION_FIELD),
  );
  const pointImageSize = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_IMAGE_SIZE_FIELD),
  );
  const pointModel = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_USE_3D_MODEL),
  );
  const pointLabel = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_USE_LABEL_FIELD),
  );
  const pointHeightReference = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_HEIGHT_REFERENCE_FIELD),
  );

  // Polyline
  const polylineColor = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_FILL_COLOR_VALUE_FIELD),
  );
  const polylineStrokeWeight = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_STROKE_WEIGHT_FIELD),
  );
  const polylineFillColorCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_FILL_COLOR_CONDITION_FIELD),
  );
  const polylineVisibilityCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_VISIBILITY_CONDITION_FIELD),
  );
  const polylineVisibilityFilter = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_VISIBILITY_FILTER_FIELD),
  );
  const polylineHeightReference = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_HEIGHT_REFERENCE_FIELD),
  );
  const polylineClassificationType = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_CLASSIFICATION_TYPE_FIELD),
  );

  // Polygon
  const polygonColor = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_FILL_COLOR_VALUE_FIELD),
  );
  const polygonStrokeWeight = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_STROKE_WEIGHT_FIELD),
  );
  const polygonStrokeColor = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_STROKE_COLOR_FIELD),
  );
  const polygonFillColorCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_FILL_COLOR_CONDITION_FIELD),
  );
  const polygonVisibilityCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_VISIBILITY_CONDITION_FIELD),
  );
  const polygonVisibilityFilter = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_VISIBILITY_FILTER_FIELD),
  );
  const polygonHeightReference = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_HEIGHT_REFERENCE_FIELD),
  );
  const polygonClassificationType = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_CLASSIFICATION_TYPE_FIELD),
  );

  // Tileset
  const tilesetFillColorCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], TILESET_FILL_COLOR_CONDITION_FIELD),
  );
  const tilesetFillGradientColor = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], TILESET_FILL_COLOR_GRADIENT_FIELD),
  );
  const [clippingBox, boxAppearance] = useClippingBox(
    useOptionalAtomValue(useFindComponent(componentAtoms ?? [], TILESET_CLIPPING)),
  );

  // General
  const styleCodeString = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], STYLE_CODE_FIELD),
  )?.preset?.code;

  const appearanceObjectFromStyleCode = useMemo(
    () => getAppearanceObject(styleCodeString) ?? {},
    [styleCodeString],
  );

  const generalAppearances: GeneralAppearances = useMemo(
    () =>
      merge({}, appearanceObjectFromStyleCode, {
        marker: {
          style: pointStyle?.preset?.style,
          pointColor:
            makeSimpleValue(pointColor) ??
            makeConditionalExpression(pointFillColorCondition) ??
            makeGradientExpression(pointFillGradientColor),
          pointSize: pointSize?.preset?.defaultValue,
          image:
            makeConditionalImageExpression(pointImageCondition),
          imageColor:
            makeConditionalImageColorExpression(pointImageCondition),
          imageSize: pointImageSize?.preset?.defaultValue,
          imageSizeInMeters: pointImageSize?.preset?.enableSizeInMeters,
          show:
            makeVisibilityFilterExpression(pointVisibilityFilter) ??
            makeVisibilityConditionExpression(pointVisibilityCondition),
          label: undefined,
          labelText: makeLabelTextExpression(pointLabel),
          labelTypography: {
            // fontSize: pointLabel?.preset?.fontSize,
            // color: pointLabel?.preset?.fontColor,
          },
          // labelBackground: pointLabel?.preset?.background,
          // labelBackgroundColor: pointLabel?.preset?.backgroundColor,
          // height: pointLabel?.preset?.height,
          // extrude: pointLabel?.preset?.extruded,
          heightReference: pointHeightReference?.preset?.defaultValue,
        },
        polyline: {
          strokeColor:
            makeSimpleValue(polylineColor) ?? makeConditionalExpression(polylineFillColorCondition),
          strokeWidth: polylineStrokeWeight?.preset?.defaultValue,
          show:
            makeVisibilityFilterExpression(polylineVisibilityFilter) ??
            makeVisibilityConditionExpression(polylineVisibilityCondition),
          clampToGround: polylineHeightReference?.preset?.defaultValue
            ? polylineHeightReference.preset.defaultValue === "clamp"
            : undefined,
          classificationType: polylineClassificationType?.preset?.defaultValue,
        },
        polygon: {
          fillColor:
            makeSimpleValue(polygonColor) ?? makeConditionalExpression(polygonFillColorCondition),
          strokeColor: polygonStrokeColor?.preset?.defaultValue,
          strokeWidth: polygonStrokeWeight?.preset?.defaultValue,
          stroke: !!polygonStrokeColor || !!polygonStrokeWeight,
          show:
            makeVisibilityFilterExpression(polygonVisibilityFilter) ??
            makeVisibilityConditionExpression(polygonVisibilityCondition),
          heightReference: polygonHeightReference?.preset?.defaultValue,
          classificationType: polygonClassificationType?.preset?.defaultValue,
        },
        model: pointModel?.preset
          ? {
              url: pointModel.preset.url,
              scale: pointModel.preset.size,
            }
          : undefined,
        "3dtiles": {
          color:
            makeConditionalExpression(tilesetFillColorCondition) ??
            makeGradientExpression(tilesetFillGradientColor),
          experimental_clipping: clippingBox,
        },
        box: boxAppearance,
      }),
    [
      appearanceObjectFromStyleCode,
      // Point
      pointColor,
      pointSize,
      pointFillColorCondition,
      pointFillGradientColor,
      pointStyle,
      pointVisibilityCondition,
      pointVisibilityFilter,
      pointImageValue,
      pointImageCondition,
      pointImageSize,
      pointModel,
      pointLabel,
      pointHeightReference,
      // Polyline
      polylineColor,
      polylineFillColorCondition,
      polylineStrokeWeight,
      polylineVisibilityCondition,
      polylineVisibilityFilter,
      polylineHeightReference,
      polylineClassificationType,
      // Polygon
      polygonColor,
      polygonFillColorCondition,
      polygonStrokeColor,
      polygonStrokeWeight,
      polygonVisibilityCondition,
      polygonVisibilityFilter,
      polygonHeightReference,
      polygonClassificationType,
      // Tileset
      tilesetFillColorCondition,
      tilesetFillGradientColor,
      clippingBox,
      boxAppearance,
    ],
  );

  return generalAppearances;
};

const getAppearanceObject = (code: string | undefined) => {
  if (!code) return undefined;
  try {
    return JSON.parse(code) as GeneralAppearances;
  } catch (error) {
    return undefined;
  }
};
