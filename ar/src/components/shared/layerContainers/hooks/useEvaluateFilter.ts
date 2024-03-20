import { isEqual } from "lodash-es";

import { defaultConditionalNumber } from "../../helpers";
import { ConditionsExpression } from "../../reearth/types";
import {
  TilesetBuildingModelFilterField,
  TilesetFloodModelFilterField,
} from "../../types/fieldComponents/3dtiles";

export const useEvaluateFilter = (
  component: TilesetBuildingModelFilterField | TilesetFloodModelFilterField | undefined,
): ConditionsExpression => {
  const { filters } = component?.value || {};

  if (!filters) return { conditions: [["true", "true"]] };

  const filterEntries = Object.entries(filters);
  if (filterEntries.every(([, { value, range }]) => isEqual(value, range)))
    return { conditions: [["true", "true"]] };

  return {
    conditions: [
      [
        Object.entries(filters).reduce((res, [propertyName, { value, range }]) => {
          if (res) {
            res += " &&";
          }

          return `${res} ${defaultConditionalNumber(propertyName, range[0])} > ${
            value[0]
          } && ${defaultConditionalNumber(propertyName, range[0])} < ${
            value[1] === range[1] ? Infinity : value[1]
          }`;
        }, ""),
        "true",
      ],
      ["true", "false"],
    ],
  };
};
