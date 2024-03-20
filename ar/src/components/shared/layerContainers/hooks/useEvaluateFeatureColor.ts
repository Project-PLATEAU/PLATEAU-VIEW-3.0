import { atom, useAtomValue } from "jotai";
import { useMemo } from "react";

import { ScreenSpaceSelectionEntry } from "../../../prototypes/screen-space-selection";
import { type LayerColorScheme } from "../../../prototypes/view-layers";
import {
  condition,
  number,
  numberOrString,
  variable,
  rgba,
  defaultConditionalNumber,
  color,
} from "../../helpers";
import { TILESET_FEATURE } from "../../reearth/layers";
import { RGBA } from "../../types";

export interface EvaluateTileFeatureColorParams {
  colorProperty?: string;
  colorScheme?: LayerColorScheme;
  defaultColor?: RGBA;
  opacity?: number;
  selections?: ScreenSpaceSelectionEntry<typeof TILESET_FEATURE>[];
}

export function useEvaluateFeatureColor({
  colorProperty,
  colorScheme,
  defaultColor = { r: 255, g: 255, b: 255, a: 1 },
  opacity,
}: EvaluateTileFeatureColorParams = {}): string | undefined {
  const blendedDefaultColor = rgba({ ...defaultColor, a: opacity ?? defaultColor.a });

  const colorSetColors = useAtomValue(
    useMemo(
      () =>
        atom(get =>
          colorScheme?.type === "qualitative"
            ? get(colorScheme.colorsAtom).map(color => ({
                ...color,
                color: color.color,
              }))
            : undefined,
        ),
      [colorScheme],
    ),
  );

  const colorMapParams = useAtomValue(
    useMemo(
      () =>
        atom(get =>
          colorScheme?.type === "quantitative"
            ? {
                colorMap: get(colorScheme.colorMapAtom),
                colorRange: get(colorScheme.colorRangeAtom),
              }
            : undefined,
        ),
      [colorScheme],
    ),
  );

  const colorExpression = useMemo(() => {
    if (colorProperty == null) {
      return blendedDefaultColor;
    }
    if (colorSetColors != null) {
      const expression = colorSetColors.reduce(
        (result, { value, color: c }) =>
          condition(
            `${variable(colorProperty)} === ${numberOrString(value)}`,
            color(c, opacity ?? 1),
            result,
          ),
        blendedDefaultColor,
      );
      if (expression) {
        return expression;
      }
    }
    if (colorMapParams) {
      let expression = blendedDefaultColor;

      const { colorMap, colorRange } = colorMapParams;
      const [minValue, maxValue] = colorRange;
      if (minValue === maxValue) {
        return expression;
      }

      const distance = 5;
      for (let i = minValue; i <= maxValue; i += distance) {
        const color = colorMap.linear((i - minValue) / (maxValue - minValue));
        expression = condition(
          `${defaultConditionalNumber(colorProperty, minValue - 1)} >= ${number(i)}`,
          rgba({ r: color[0] * 255, g: color[1] * 255, b: color[2] * 255, a: opacity ?? 1 }),
          expression,
        );
      }
      return expression;
    }
  }, [colorProperty, colorSetColors, colorMapParams, blendedDefaultColor, opacity]);

  return colorExpression;
}
