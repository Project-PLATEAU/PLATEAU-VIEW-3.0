import { isEqual } from "lodash-es";
import { useMemo } from "react";

import { defaultConditionalNumber, isNumber, variable } from "../../helpers";
import { ConditionsExpression } from "../../reearth/types";
import {
  TilesetBuildingModelFilterField,
  TilesetFloodModelFilterField,
} from "../../types/fieldComponents/3dtiles";

export const useEvaluateFilter = (
  component: TilesetBuildingModelFilterField | TilesetFloodModelFilterField | undefined,
): ConditionsExpression => {
  const filterConditionExpression: ConditionsExpression = useMemo(() => {
    const { filters } = component?.value || {};

    if (!filters) return { conditions: [["true", "true"]] };

    const filterEntries = Object.entries(filters);
    if (filterEntries.every(([, { value, range }]) => isEqual(value, range)))
      return { conditions: [["true", "true"]] };

    return {
      conditions: [
        [
          Object.entries(filters).reduce(
            (res, [propertyName, { value, range, accessor, defaultValue }]) => {
              if (res) {
                res += " &&";
              }

              const isSameRange = value[0] === range[0] && value[1] === range[1];
              if (isSameRange) {
                return `${res} true`;
              }

              if (defaultValue != null) {
                return `${res} ${defaultConditionalNumber(
                  accessor || propertyName,
                  defaultValue,
                )} >= ${value[0]} && ${defaultConditionalNumber(
                  accessor || propertyName,
                  defaultValue,
                )} <= ${value[1]}`;
              }

              return `${res} ${isNumber(accessor || propertyName)} && ${variable(
                accessor || propertyName,
              )} >= ${value[0]} && ${variable(accessor || propertyName)} <= ${value[1]}`;
            },
            "",
          ),
          "true",
        ],
        ["true", "false"],
      ],
    };
  }, [component?.value]);

  return filterConditionExpression;
};
