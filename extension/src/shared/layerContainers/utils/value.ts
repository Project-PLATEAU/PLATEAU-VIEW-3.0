import { isNotNullish } from "../../../prototypes/type-helpers";
import { COLOR_MAPS } from "../../constants";
import {
  color,
  conditionWithOperation,
  defaultConditionalNumber,
  number,
  rgba,
  string,
  variable,
} from "../../helpers";
import { ExpressionContainer } from "../../reearth/types/expression";
import { Component } from "../../types/fieldComponents";
import {
  TILESET_FILL_COLOR_CONDITION_FIELD,
  TILESET_FILL_COLOR_GRADIENT_FIELD,
} from "../../types/fieldComponents/3dtiles";
import { OPACITY_FIELD } from "../../types/fieldComponents/general";
import {
  POINT_FILL_COLOR_VALUE_FIELD,
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
  POINT_VISIBILITY_FILTER_FIELD,
  POINT_USE_IMAGE_CONDITION_FIELD,
  POINT_VISIBILITY_CONDITION_FIELD,
  POINT_USE_LABEL_FIELD,
} from "../../types/fieldComponents/point";
import {
  POLYGON_FILL_COLOR_CONDITION_FIELD,
  POLYGON_FILL_COLOR_VALUE_FIELD,
  POLYGON_VISIBILITY_CONDITION_FIELD,
  POLYGON_VISIBILITY_FILTER_FIELD,
} from "../../types/fieldComponents/polygon";
import {
  POLYLINE_FILL_COLOR_CONDITION_FIELD,
  POLYLINE_FILL_COLOR_VALUE_FIELD,
  POLYLINE_VISIBILITY_CONDITION_FIELD,
  POLYLINE_VISIBILITY_FILTER_FIELD,
} from "../../types/fieldComponents/polyline";

import { colorWithAlpha } from "./color";

export const DEFAULT_COLOR = "#ffffff";

export const makeSimpleColorValue = (
  comp:
    | Component<
        | typeof POINT_FILL_COLOR_VALUE_FIELD
        | typeof POLYLINE_FILL_COLOR_VALUE_FIELD
        | typeof POLYGON_FILL_COLOR_VALUE_FIELD
      >
    | undefined,
  opacity: number | undefined,
): string | undefined => {
  if (!comp) return;

  switch (comp.type) {
    // Point
    case POINT_FILL_COLOR_VALUE_FIELD:
      return colorWithAlpha(comp.value?.color || comp.preset?.defaultValue, opacity);
    // Polyline
    case POLYLINE_FILL_COLOR_VALUE_FIELD:
      return colorWithAlpha(comp.value?.color || comp.preset?.defaultValue, opacity);
    // Polygon
    case POLYGON_FILL_COLOR_VALUE_FIELD:
      return colorWithAlpha(comp.value?.color || comp.preset?.defaultValue, opacity);
    default:
      return;
  }
};

export const makeSimpleValueForStrokeColor = (
  comp: Component<typeof POLYGON_FILL_COLOR_VALUE_FIELD> | undefined,
  opacity: number | undefined,
): string | undefined => {
  if (!comp) return;
  let strokeColor;
  let fillColor;
  switch (comp.type) {
    // Polygon
    case POLYGON_FILL_COLOR_VALUE_FIELD:
      strokeColor = colorWithAlpha(comp.value?.strokeColor || comp.preset?.strokeValue, opacity);
      fillColor = colorWithAlpha(comp.value?.color || comp.preset?.defaultValue, opacity);
      return strokeColor === "" ? fillColor : strokeColor;
    default:
      return;
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
  opacity = 1,
): ExpressionContainer | undefined => {
  if (!comp) return;

  const currentRuleId =
    comp.value?.useDefault || comp.preset?.rules?.some(r => r.asDefaultRule)
      ? comp.value?.currentRuleId ??
        comp.preset?.rules?.find(r => r.asDefaultRule)?.id ??
        comp.preset?.rules?.[0]?.id
      : comp.value?.currentRuleId;

  return {
    expression: {
      conditions: [
        ...(
          comp.preset?.rules?.flatMap(rule => {
            if (rule.id !== currentRuleId) return;
            const overriddenRules = comp.value?.overrideRules.filter(r => r.ruleId === rule.id);
            return rule.conditions?.map(cond => {
              const overriddenCondition = overriddenRules?.find(r => r.conditionId === cond.id);
              const colorValue = overriddenCondition?.color || cond.color;
              const propertyName = cond.propertyName || rule.propertyName;
              if (!propertyName || !cond.value || !colorValue) return;
              const stringCondition = conditionWithOperation(
                variable(propertyName),
                string(cond.value),
                cond.operation,
              );
              const numberCondition = !isNaN(Number(cond.value))
                ? conditionWithOperation(
                    defaultConditionalNumber(propertyName),
                    number(Number(cond.value)),
                    cond.operation,
                  )
                : undefined;
              return propertyName && cond.value && colorValue
                ? ([
                    numberCondition ? numberCondition : stringCondition,
                    color(colorValue, opacity),
                  ] as [string, string])
                : undefined;
            });
          }) ?? []
        ).filter(isNotNullish),
        ["true", color(DEFAULT_COLOR, opacity)],
      ],
    },
  };
};

export const makeStrokeColorConditionalExpression = (
  comp: Component<typeof POLYGON_FILL_COLOR_CONDITION_FIELD> | undefined,
  opacity = 1,
): ExpressionContainer | undefined => {
  if (!comp) return;

  const currentRuleId =
    comp.value?.useDefault || comp.preset?.rules?.some(r => r.asDefaultRule)
      ? comp.value?.currentRuleId ??
        comp.preset?.rules?.find(r => r.asDefaultRule)?.id ??
        comp.preset?.rules?.[0]?.id
      : comp.value?.currentRuleId;

  return {
    expression: {
      conditions: [
        ...(
          comp.preset?.rules?.flatMap(rule => {
            if (rule.id !== currentRuleId) return;
            const overriddenRules = comp.value?.overrideRules.filter(r => r.ruleId === rule.id);
            return rule.conditions?.map(cond => {
              const overriddenCondition = overriddenRules?.find(r => r.conditionId === cond.id);
              const colorValue = overriddenCondition?.strokeColor || cond.strokeColor;
              const propertyName = cond.propertyName || rule.propertyName;
              if (!propertyName || !cond.value || !colorValue) return;
              const stringCondition = conditionWithOperation(
                variable(propertyName),
                string(cond.value),
                cond.operation,
              );
              const numberCondition = !isNaN(Number(cond.value))
                ? conditionWithOperation(
                    defaultConditionalNumber(propertyName),
                    number(Number(cond.value)),
                    cond.operation,
                  )
                : undefined;
              return propertyName && cond.value && colorValue
                ? ([
                    numberCondition ? numberCondition : stringCondition,
                    color(colorValue, opacity),
                  ] as [string, string])
                : undefined;
            });
          }) ?? []
        ).filter(isNotNullish),
        ["true", color(DEFAULT_COLOR, 0)],
      ],
    },
  };
};

export const makeGradientExpression = (
  comp:
    | Component<typeof POINT_FILL_COLOR_GRADIENT_FIELD | typeof TILESET_FILL_COLOR_GRADIENT_FIELD>
    | undefined,
  opacity = 1,
): ExpressionContainer | undefined => {
  if (!comp) return;

  const preset = comp.preset;
  const value = comp.value;
  const currentRuleId =
    comp.value?.useDefault || comp.preset?.rules?.some(r => r.asDefaultRule)
      ? comp.value?.currentRuleId ??
        comp.preset?.rules?.find(r => r.asDefaultRule)?.id ??
        comp.preset?.rules?.[0]?.id
      : comp.value?.currentRuleId;
  const rule = preset?.rules?.find(r => r.id === currentRuleId);

  const conditions: [string, string][] = [["true", color(DEFAULT_COLOR, opacity)]];

  const [minValue, maxValue] = [
    value?.currentMin ?? rule?.min ?? 0,
    value?.currentMax ?? rule?.max ?? 0,
  ];
  if (minValue === maxValue) {
    return {
      expression: { conditions },
    };
  }

  const colorMap = COLOR_MAPS.find(
    c => c.name === (value?.currentColorMapName ?? rule?.colorMapName),
  );
  const colorProperty = rule?.propertyName;

  if (!colorMap || !colorProperty) return { expression: { conditions } };

  const distance = 5;
  for (let i = minValue; i <= maxValue; i += distance) {
    const color = colorMap.linear((i - minValue) / (maxValue - minValue));
    conditions.unshift([
      `${defaultConditionalNumber(colorProperty, minValue - 1)} >= ${number(i)}`,
      rgba({ r: color[0] * 255, g: color[1] * 255, b: color[2] * 255, a: opacity }),
    ]);
  }

  return {
    expression: {
      conditions,
    },
  };
};

export const makeSimpleColorWithOpacity = (
  comp: Component<typeof OPACITY_FIELD> | undefined,
  originColor: string | undefined,
) => {
  if (!comp || !originColor) return;
  return {
    expression: {
      conditions: [["true", color(originColor, comp.value ?? comp?.preset?.defaultValue ?? 1)]],
    },
  };
};

export const makeVisibilityConditionExpression = (
  comp:
    | Component<
        | typeof POINT_VISIBILITY_CONDITION_FIELD
        | typeof POLYLINE_VISIBILITY_CONDITION_FIELD
        | typeof POLYGON_VISIBILITY_CONDITION_FIELD
      >
    | undefined,
): ExpressionContainer | undefined => {
  const conditions = comp?.preset?.conditions;

  if (!conditions) return;

  return {
    expression: {
      conditions: conditions.reduce(
        (res, cond) => {
          const isNumber = !isNaN(Number(cond.value));
          if (!cond.operation || !cond.value || !cond.propertyName) return res;
          res.unshift([
            isNumber
              ? conditionWithOperation(
                  defaultConditionalNumber(cond.propertyName),
                  cond.value,
                  cond.operation,
                )
              : conditionWithOperation(
                  variable(cond.propertyName),
                  string(cond.value),
                  cond.operation,
                ),
            cond.show ? "true" : "false",
          ]);
          return res;
        },
        [["true", "false"]],
      ),
    },
  };
};

export const makeVisibilityFilterExpression = (
  comp:
    | Component<
        | typeof POINT_VISIBILITY_FILTER_FIELD
        | typeof POLYLINE_VISIBILITY_FILTER_FIELD
        | typeof POLYGON_VISIBILITY_FILTER_FIELD
      >
    | undefined,
): ExpressionContainer | undefined => {
  const rule =
    comp?.preset?.rules?.find(rule => rule.id === comp.value) ??
    comp?.preset?.rules?.find(rule => rule.asDefaultRule) ??
    comp?.preset?.rules?.[0];
  const property = rule?.propertyName;

  if (!rule?.conditions || !property) return;

  return {
    expression: {
      conditions: rule.conditions.reduce(
        (res, cond) => {
          const isNumber = !isNaN(Number(cond.value));
          if (!cond.operation || !cond.value) return res;
          res.unshift([
            isNumber
              ? conditionWithOperation(
                  defaultConditionalNumber(property),
                  cond.value,
                  cond.operation,
                )
              : conditionWithOperation(variable(property), string(cond.value), cond.operation),
            "true",
          ]);
          return res;
        },
        [["true", "false"]],
      ),
    },
  };
};

export const makeConditionalImageExpression = (
  comp: Component<typeof POINT_USE_IMAGE_CONDITION_FIELD> | undefined,
): ExpressionContainer | undefined => {
  if (!comp) return;
  const currentRuleId =
    comp.value?.currentRuleId ??
    comp.preset?.rules?.find(r => r.asDefaultRule)?.id ??
    comp.preset?.rules?.[0]?.id;
  return {
    expression: {
      conditions: [
        ...(
          comp.preset?.rules?.flatMap(rule => {
            if (rule.id !== currentRuleId) return;
            const overriddenRules = comp.value?.overrideRules.filter(r => r.ruleId === rule.id);
            return rule.conditions?.map(cond => {
              const overriddenCondition = overriddenRules?.find(r => r.conditionId === cond.id);
              const imageURLValue = overriddenCondition?.imageURL || cond.imageURL;
              const propertyName = cond.propertyName || rule.propertyName;
              if (!propertyName || !cond.value || !imageURLValue) return;
              const stringCondition = conditionWithOperation(
                variable(propertyName),
                string(cond.value),
                cond.operation,
              );
              const numberCondition = !isNaN(Number(cond.value))
                ? conditionWithOperation(
                    defaultConditionalNumber(propertyName),
                    number(Number(cond.value)),
                    cond.operation,
                  )
                : undefined;
              return propertyName && cond.value && imageURLValue
                ? ([
                    numberCondition ? `${numberCondition} || ${stringCondition}` : stringCondition,
                    `"${imageURLValue}"`,
                  ] as [string, string])
                : undefined;
            });
          }) ?? []
        ).filter(isNotNullish),
      ],
    },
  };
};

export const makeConditionalImageColorExpression = (
  comp: Component<typeof POINT_USE_IMAGE_CONDITION_FIELD> | undefined,
  opacity: number | undefined,
): ExpressionContainer | undefined => {
  if (!comp) return;
  const currentRuleId =
    comp.value?.currentRuleId ??
    comp.preset?.rules?.find(r => r.asDefaultRule)?.id ??
    comp.preset?.rules?.[0]?.id;
  return {
    expression: {
      conditions: [
        ...(
          comp.preset?.rules?.flatMap(rule => {
            if (rule.id !== currentRuleId) return;
            const overriddenRules = comp.value?.overrideRules.filter(r => r.ruleId === rule.id);
            return rule.conditions?.map(cond => {
              const overriddenCondition = overriddenRules?.find(r => r.conditionId === cond.id);
              const imageColorValue = colorWithAlpha(
                overriddenCondition?.imageColor || cond.imageColor,
                opacity,
              );
              const propertyName = cond.propertyName || rule.propertyName;
              if (!propertyName || !cond.value || !imageColorValue) return;
              const stringCondition = conditionWithOperation(
                variable(propertyName),
                string(cond.value),
                cond.operation,
              );
              const numberCondition = !isNaN(Number(cond.value))
                ? conditionWithOperation(
                    defaultConditionalNumber(propertyName),
                    number(Number(cond.value)),
                    cond.operation,
                  )
                : undefined;
              return propertyName && cond.value && imageColorValue
                ? ([
                    numberCondition ? `${numberCondition} || ${stringCondition}` : stringCondition,
                    `color("${imageColorValue}")`,
                  ] as [string, string])
                : undefined;
            });
          }) ?? []
        ).filter(isNotNullish),
      ],
    },
  };
};

export const makeLabelTextExpression = (
  comp: Component<typeof POINT_USE_LABEL_FIELD> | undefined,
): ExpressionContainer | string | undefined => {
  if (!comp) return;
  const textExpression = comp.preset?.textExpression;
  if (!textExpression?.startsWith("=")) return textExpression;
  return {
    expression: {
      conditions: [["true", textExpression.substring(1)]],
    },
  };
};
