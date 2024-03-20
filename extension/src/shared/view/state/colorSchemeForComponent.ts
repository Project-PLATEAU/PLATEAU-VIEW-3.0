import { Atom, PrimitiveAtom, SetStateAction, atom } from "jotai";
import { splitAtom } from "jotai/utils";
import { uniqWith } from "lodash-es";

import { ColorMap } from "../../../prototypes/color-maps";
import {
  QualitativeColor,
  QualitativeColorSet,
  QuantitativeColorMap,
} from "../../../prototypes/datasets";
import { isNotNullish } from "../../../prototypes/type-helpers";
import { LayerColorScheme } from "../../../prototypes/view-layers";
import { COLOR_MAPS } from "../../constants";
import { ComponentBase } from "../../types/fieldComponents";
import {
  CONDITIONAL_COLOR_SCHEME,
  GRADIENT_COLOR_SCHEME,
  ConditionalColorSchemeValue,
  GradientColorSchemeValue,
  ValueColorSchemeValue,
  VALUE_COLOR_SCHEME,
} from "../../types/fieldComponents/colorScheme";
import {
  POLYGON_FILL_COLOR_CONDITION_FIELD,
  POLYGON_FILL_COLOR_VALUE_FIELD,
} from "../../types/fieldComponents/polygon";
import { LayerModel } from "../../view-layers";

export const isColorSchemeComponent = (
  comp: ComponentBase,
): comp is Extract<
  ComponentBase,
  { value?: ConditionalColorSchemeValue | GradientColorSchemeValue | ValueColorSchemeValue }
> =>
  !!(
    comp.value &&
    typeof comp.value === "object" &&
    "type" in comp.value &&
    [CONDITIONAL_COLOR_SCHEME, GRADIENT_COLOR_SCHEME, VALUE_COLOR_SCHEME].includes(comp.value.type)
  );

export const isConditionalColorSchemeComponent = (
  comp: ComponentBase,
): comp is Extract<ComponentBase, { value?: ConditionalColorSchemeValue }> =>
  !!(isColorSchemeComponent(comp) && CONDITIONAL_COLOR_SCHEME === comp.value?.type);

export const isValueColorSchemeComponent = (
  comp: ComponentBase,
): comp is Extract<ComponentBase, { value?: ValueColorSchemeValue }> =>
  !!(isColorSchemeComponent(comp) && VALUE_COLOR_SCHEME === comp.value?.type);

export const isGradientColorSchemeComponent = (
  comp: ComponentBase,
): comp is Extract<ComponentBase, { value?: GradientColorSchemeValue }> =>
  !!(isColorSchemeComponent(comp) && GRADIENT_COLOR_SCHEME === comp.value?.type);

// TODO: Support multiple color schcme if necessary
export const makeColorSchemeForComponent = (colorSchemeAtom: Atom<LayerColorScheme | undefined>) =>
  atom(get => {
    const colorScheme = get(colorSchemeAtom);
    switch (colorScheme?.type) {
      case "quantitative":
        return {
          type: "quantitative" as const,
          name: colorScheme.name,
          colorMap: get(colorScheme.colorMapAtom),
          colorRange: get(colorScheme.colorRangeAtom),
        };
      case "qualitative": {
        return {
          type: "qualitative" as const,
          name: colorScheme.name,
          colors: get(colorScheme.colorsAtom),
        };
      }
    }
  });

// TODO: Support multiple color schcme if necessary
export const makeColorSchemeAtomForComponent = (layers: readonly LayerModel[]) =>
  atom<LayerColorScheme | undefined>(get => {
    const layer = layers[0];
    if (!layer) return;

    const componentAtom = layer.componentAtoms?.find(comp => {
      const value = get(comp.atom);
      return isColorSchemeComponent(value);
    });
    if (!componentAtom) {
      return;
    }
    const component = get(componentAtom.atom);
    const colorScheme = component.value as
      | ConditionalColorSchemeValue
      | GradientColorSchemeValue
      | ValueColorSchemeValue;
    switch (colorScheme.type) {
      case GRADIENT_COLOR_SCHEME: {
        if (!isGradientColorSchemeComponent(component)) return;

        const currentRuleId =
          colorScheme.useDefault || component.preset?.rules?.some(r => r.asDefaultRule)
            ? colorScheme.currentRuleId ??
              component.preset?.rules?.find(r => r.asDefaultRule)?.id ??
              component.preset?.rules?.[0]?.id
            : colorScheme.currentRuleId;
        const rule = component.preset?.rules?.find(rule => rule.id === currentRuleId);
        const value = component.value;
        const colorMap = COLOR_MAPS.find(
          c => c.name === (value?.currentColorMapName ?? rule?.colorMapName),
        );

        if (!colorMap) return;

        const colorRange = [
          value?.currentMin ?? rule?.min ?? 0,
          value?.currentMax ?? rule?.max ?? 0,
        ];

        return {
          type: "quantitative" as const,
          name: rule?.legendName || rule?.propertyName,
          colorMapAtom: atom(
            () =>
              COLOR_MAPS.find(c => c.name === (value?.currentColorMapName ?? rule?.colorMapName)),
            (_get, set, action: SetStateAction<ColorMap>) => {
              const component = get(componentAtom.atom);
              if (!isGradientColorSchemeComponent(component)) return;
              const update = typeof action === "function" ? action(colorMap) : action;
              set(componentAtom.atom, {
                ...component,
                value: {
                  ...(component.value ?? {}),
                  currentColorMapName: update.name,
                } as typeof component.value,
              });
            },
          ),
          colorRangeAtom: atom(
            () => colorRange,
            (_get, set, action: SetStateAction<number[]>) => {
              const update = typeof action === "function" ? action(colorRange) : action;
              set(componentAtom.atom, {
                ...component,
                value: {
                  ...(component.value ?? {}),
                  currentMin: update[0],
                  currentMax: update[1],
                } as typeof component.value,
              });
            },
          ),
          valueRangeAtom: atom(
            () => [rule?.min, rule?.max],
            () => {},
          ),
        } as QuantitativeColorMap;
      }
      case CONDITIONAL_COLOR_SCHEME: {
        if (!isConditionalColorSchemeComponent(component)) return;
        const currentColors: QualitativeColor[] = [];
        const defaultColors: QualitativeColor[] = [];

        const currentRuleId =
          colorScheme.useDefault || component.preset?.rules?.some(r => r.asDefaultRule)
            ? colorScheme.currentRuleId ??
              component.preset?.rules?.find(r => r.asDefaultRule)?.id ??
              component.preset?.rules?.[0]?.id
            : colorScheme.currentRuleId;
        const rule = component.preset?.rules?.find(rule => rule.id === currentRuleId);

        if (!rule?.propertyName || !rule.conditions) return;

        rule?.conditions?.forEach((cond): QualitativeColor | undefined => {
          if (!cond.asLegend) return;

          const overriddenCondition = component.value?.overrideRules.find(
            o => o.ruleId === rule.id && o.conditionId === cond.id,
          );
          const overriddenColor = overriddenCondition?.color;

          // Polygon always has stroke to compat exists data
          const hasStroke = component.type === POLYGON_FILL_COLOR_CONDITION_FIELD;
          const overriddenStrokeColor = overriddenCondition?.strokeColor;

          if (cond.color && cond.value) {
            const c: QualitativeColor = {
              id: cond.id,
              value: cond.value,
              color: overriddenColor ?? cond.color ?? "",
              name: cond.legendName || cond.value,
            };
            const dc: QualitativeColor = {
              id: cond.id,
              value: cond.value,
              color: cond.color,
              name: cond.legendName || cond.value,
            };

            if (hasStroke) {
              const condStrokeColor =
                typeof cond === "object" &&
                "strokeColor" in cond &&
                typeof cond.strokeColor === "string"
                  ? cond.strokeColor
                  : "";

              c.strokeColor = overriddenStrokeColor || condStrokeColor || cond.color;
              dc.strokeColor =
                typeof cond === "object" &&
                "strokeColor" in cond &&
                typeof cond.strokeColor === "string"
                  ? cond.strokeColor
                  : cond.color;
            }
            if (isNotNullish(c)) {
              currentColors.push(c);
            }
            if (isNotNullish(dc)) {
              defaultColors.push(dc);
            }
          }
        });

        const colorsAtom = atom(
          () => currentColors,
          (_get, set, action: SetStateAction<QualitativeColor[]>) => {
            const update = typeof action === "function" ? action(currentColors) : action;
            const currentRuleId =
              colorScheme.useDefault || component.preset?.rules?.some(r => r.asDefaultRule)
                ? colorScheme.currentRuleId ??
                  component.preset?.rules?.find(r => r.asDefaultRule)?.id ??
                  component.preset?.rules?.[0]?.id
                : colorScheme.currentRuleId;
            set(componentAtom.atom, {
              ...component,
              value: {
                ...(component.value ?? {}),
                overrideRules: uniqWith(
                  [
                    ...(update
                      ?.map(color => ({
                        ruleId: currentRuleId,
                        conditionId: color.id,
                        color: color.color,
                        strokeColor: color.strokeColor,
                      }))
                      .filter(isNotNullish) ?? []),
                    ...(component.value?.overrideRules ?? []),
                  ],
                  (a, b) => a.ruleId === b.ruleId && a.conditionId === b.conditionId,
                ),
              } as typeof component.value,
            });
          },
        ) as unknown as PrimitiveAtom<QualitativeColor[]>; // For compat
        return currentColors.length
          ? ({
              type: "qualitative" as const,
              name: rule.legendName || rule.propertyName,
              defaultColors,
              colorsAtom: colorsAtom,
              colorAtomsAtom: splitAtom(colorsAtom),
            } as QualitativeColorSet)
          : undefined;
      }
      case VALUE_COLOR_SCHEME: {
        if (!isValueColorSchemeComponent(component)) return;
        const hasStroke = component.type === POLYGON_FILL_COLOR_VALUE_FIELD;
        const strokeColor =
          component.value?.strokeColor || (hasStroke ? component.preset?.strokeValue : "");
        const color = (component.value?.color || component.preset?.defaultValue) ?? "";
        const colors = hasStroke
          ? component.preset?.defaultValue || strokeColor
            ? [
                {
                  id: component.id,
                  value: component.preset?.defaultValue ?? "",
                  color,
                  // use fill color if strokeColor is not set
                  strokeColor: strokeColor === "" ? color : strokeColor,
                  name: component.preset?.legendName ?? "",
                },
              ]
            : []
          : component.preset?.defaultValue
          ? [
              {
                id: component.id,
                value: component.preset?.defaultValue ?? "",
                color,
                name: component.preset?.legendName ?? "",
              },
            ]
          : [];

        const defaultColors: QualitativeColor[] = [
          {
            id: component.id,
            value: component.preset?.defaultValue ?? "",
            color: component.preset?.defaultValue ?? "",
            name: component.preset?.legendName ?? "",
          },
        ];
        if (hasStroke) {
          defaultColors[0].strokeColor = component.preset?.strokeValue;
        }

        const colorsAtom = atom(
          () => colors,
          (_get, set, action: SetStateAction<QualitativeColor[]>) => {
            const update = typeof action === "function" ? action(colors) : action;
            set(componentAtom.atom, {
              ...component,
              value: {
                ...(component.value ?? {}),
                color: update[0].color,
                strokeColor: update[0].strokeColor,
              } as typeof component.value,
            });
          },
        ) as unknown as PrimitiveAtom<QualitativeColor[]>; // For compat
        return component.preset?.asLegend
          ? ({
              type: "qualitative" as const,
              name: get(layer.titleAtom),
              defaultColors,
              colorsAtom: colorsAtom,
              colorAtomsAtom: splitAtom(colorsAtom),
            } as QualitativeColorSet)
          : undefined;
      }
    }
  });
