import { groupBy } from "lodash-es";

import { CameraPosition } from "../../../../extension/src/shared/reearth/types";
import {
  TILESET_BUILDING_MODEL_COLOR,
  TILESET_BUILDING_MODEL_FILTER,
  TILESET_CLIPPING,
  TILESET_FLOOD_MODEL_COLOR,
  TILESET_FLOOD_MODEL_FILTER,
} from "../../../../extension/src/shared/types/fieldComponents/3dtiles";
import {
  APPLY_TIME_VALUE_FIELD,
  DATASET_STORY_FIELD,
  LAYER_DESCRIPTION_FIELD,
  LINK_BUTTON_FIELD,
  OPACITY_FIELD,
  STYLE_CODE_FIELD,
  TIMELINE_CUSTOMIZED_FIELD,
} from "../../../../extension/src/shared/types/fieldComponents/general";
import {
  POINT_CONVERT_FROM_CSV,
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
  POINT_FILL_COLOR_VALUE_FIELD,
  POINT_HEIGHT_REFERENCE_FIELD,
  POINT_IMAGE_SIZE_FIELD,
  POINT_SIZE_FIELD,
  POINT_STROKE_FIELD,
  POINT_USE_3D_MODEL,
  POINT_USE_IMAGE_VALUE_FIELD,
  POINT_USE_LABEL_FIELD,
  POINT_VISIBILITY_FILTER_FIELD,
} from "../../../../extension/src/shared/types/fieldComponents/point";
import {
  POLYGON_CLASSIFICATION_TYPE_FIELD,
  POLYGON_FILL_COLOR_CONDITION_FIELD,
  POLYGON_FILL_COLOR_VALUE_FIELD,
  POLYGON_HEIGHT_REFERENCE_FIELD,
  POLYGON_STROKE_COLOR_FIELD,
  POLYGON_STROKE_WEIGHT_FIELD,
  POLYGON_VISIBILITY_FILTER_FIELD,
} from "../../../../extension/src/shared/types/fieldComponents/polygon";
import {
  POLYLINE_CLASSIFICATION_TYPE_FIELD,
  POLYLINE_FILL_COLOR_CONDITION_FIELD,
  POLYLINE_FILL_COLOR_VALUE_FIELD,
  POLYLINE_HEIGHT_REFERENCE_FIELD,
  POLYLINE_STROKE_WEIGHT_FIELD,
  POLYLINE_VISIBILITY_FILTER_FIELD,
} from "../../../../extension/src/shared/types/fieldComponents/polyline";
import { generateID } from "../../../../extension/src/shared/utils/id";
import { FieldComponent as View2FieldComponent } from "../../types/view2";
import {
  ComponentGroup as View3ComponentGroup,
  Component as View3Component,
} from "../../types/view3";
import { FieldFeatureType } from "../type";

import { GENERAL_FIELDS } from "./general";
import {
  checkIsSingleValue,
  findLegendTitleByColor,
  formatDateTime,
  getPropertyName,
  makeColorField,
  removeQuote,
} from "./utils/fields";

export const EXCEPT_COMPONENTS_TYPE = [
  "legend",
  "legendGradient",
  "infoboxStyle",
  "switchDataset",
  "switchGroup",
  "template",
  "buildingShadow",
  "polylineColorGradient",
  "polygonColorGradient",
  ...GENERAL_FIELDS,
] satisfies View2FieldComponent["type"][];
export type GeneralComponent = Extract<
  View2FieldComponent["type"],
  (typeof EXCEPT_COMPONENTS_TYPE)[number]
>;

export type ConvertableComponent = Exclude<View2FieldComponent["type"], GeneralComponent>;

export type InferView3Component<
  K extends ConvertableComponent,
  C extends typeof CORRESPONDING_COMPONENT = typeof CORRESPONDING_COMPONENT,
> = C[K] extends Array<any>
  ? {
      [K2 in Exclude<C[K][number], undefined>]: Omit<View3Component<K2>, "value">;
    }[Exclude<C[K][number], undefined>]
  : C[K] extends View3ComponentGroup["components"][number]["type"]
  ? Omit<View3Component<Exclude<C[K], undefined>>, "value">
  : never;

export const CONVERT_FIELDS: {
  [K in ConvertableComponent]: (
    view2Component: Extract<View2FieldComponent, { type: K }>,
    view2Components: View2FieldComponent[],
    options?: {
      featureType?: FieldFeatureType;
    },
  ) => InferView3Component<K> | InferView3Component<K>[];
} = {
  // general
  description: c => {
    return {
      type: LAYER_DESCRIPTION_FIELD,
      preset: {
        description: c.content,
      },
    };
  },
  styleCode: c => {
    return {
      type: STYLE_CODE_FIELD,
      preset: {
        code: c.src,
      },
    };
  },
  buttonLink: c => {
    return {
      type: LINK_BUTTON_FIELD,
      preset: {
        url: c.link ?? "",
        title: c.title ?? "",
      },
    };
  },
  story: c => {
    const flatStories = c.stories?.flatMap(
      story =>
        JSON.parse(story.scenes || "[]") as {
          title: string;
          description: string;
          camera: CameraPosition;
        },
    );
    return {
      type: DATASET_STORY_FIELD,
      preset: {
        pages:
          flatStories?.map(story => {
            return {
              id: generateID(),
              title: story.title,
              camera: story.camera,
              content: story.description,
            };
          }) ?? [],
      },
    };
  },
  currentTime: c => {
    return {
      type: TIMELINE_CUSTOMIZED_FIELD,
      preset: {
        start: formatDateTime(c.startDate, c.startTime),
        end: formatDateTime(c.stopDate, c.stopTime),
        current: formatDateTime(c.currentDate, c.currentTime),
        timezone: "+9",
      },
    };
  },
  switchVisibility: (c, _cs, options) => {
    if (c.conditions.length === 1) {
      throw new Error(`${c.type} has only one value`);
    }

    const firstCondition = c.conditions[0];
    const secondCondition = c.conditions[1];
    const isFirstItemDefault =
      firstCondition.condition.operand === "true" || firstCondition.condition.operand === true;
    const conditionGroup = Object.entries(
      groupBy(c.conditions.slice(isFirstItemDefault ? 1 : 0), v => v.title),
    );
    const rules = [
      ...(isFirstItemDefault && secondCondition
        ? [
            {
              id: generateID(),
              propertyName: getPropertyName(secondCondition.condition.operand),
              legendName: firstCondition.title,
              conditions: [
                {
                  id: generateID(),
                  operation: "!==" as const,
                  value: "$DISPLAY_ALL$",
                },
              ],
            },
          ]
        : []),
      ...conditionGroup.map(([title, condition]) => {
        const propertyName = getPropertyName(condition[0].condition.operand);
        return {
          id: generateID(),
          propertyName,
          legendName: title,
          conditions: condition.map(cond => {
            return {
              id: generateID(),
              operation: cond.condition.operator,
              value: removeQuote(cond.condition.value.toString()),
            };
          }),
        };
      }),
    ];
    switch (options?.featureType) {
      case "marker":
        return {
          type: POINT_VISIBILITY_FILTER_FIELD,
          preset: {
            rules,
          },
        };
      case "polyline":
        return {
          type: POLYLINE_VISIBILITY_FILTER_FIELD,
          preset: {
            rules,
          },
        };
      case "polygon":
        return {
          type: POLYGON_VISIBILITY_FILTER_FIELD,
          preset: {
            rules,
          },
        };
      default:
        return [
          {
            type: POINT_VISIBILITY_FILTER_FIELD,
            preset: {
              rules,
            },
          },
          {
            type: POLYLINE_VISIBILITY_FILTER_FIELD,
            preset: {
              rules,
            },
          },
          {
            type: POLYGON_VISIBILITY_FILTER_FIELD,
            preset: {
              rules,
            },
          },
        ];
    }
  },
  heightReference: (c, _cs, options) => {
    const preset = {
      defaultValue: c.heightReferenceType,
    };
    switch (options?.featureType) {
      case "marker":
        return {
          type: POINT_HEIGHT_REFERENCE_FIELD,
          preset,
        };
      case "polyline":
        return {
          type: POLYLINE_HEIGHT_REFERENCE_FIELD,
          preset,
        };
      case "polygon":
        return {
          type: POLYGON_HEIGHT_REFERENCE_FIELD,
          preset,
        };
      default:
        return [
          {
            type: POINT_HEIGHT_REFERENCE_FIELD,
            preset,
          },
          {
            type: POLYLINE_HEIGHT_REFERENCE_FIELD,
            preset,
          },
          {
            type: POLYGON_HEIGHT_REFERENCE_FIELD,
            preset,
          },
        ];
    }
  },
  timeline: c => {
    return {
      type: APPLY_TIME_VALUE_FIELD,
      preset: {
        propertyName: c.timeFieldName,
      },
    };
  },
  // point
  pointColor: (c, cs) => {
    if (c.pointColors?.length === 1 && checkIsSingleValue(c.pointColors[0].condition)) {
      return {
        type: POINT_FILL_COLOR_VALUE_FIELD,
        preset: makeColorField(cs, c.pointColors[0].color),
      };
    }
    const isFirstItemDefault =
      c.pointColors?.[0].condition.operand === "true" ||
      (c.pointColors?.[0].condition.operand as unknown as boolean) === true;
    const firstDefaultItem = c.pointColors?.[0];

    const conditionGroup = Object.entries(
      groupBy(c.pointColors?.slice(isFirstItemDefault ? 1 : 0), v => v.condition.operand),
    );

    const legendCache: Record<string, string> = {};
    const storeLegendCache = (legend: string | undefined, color: string) =>
      legend && (legendCache[legend] = color);
    const checkIsLegendAlreadyUsed = (legend: string | undefined, color: string) =>
      !!(legend && legendCache[legend] && legendCache[legend] === color);

    return {
      type: POINT_FILL_COLOR_CONDITION_FIELD,
      preset: {
        rules: conditionGroup.map(([operand, condition]) => {
          const propertyName = getPropertyName(operand);
          return {
            id: generateID(),
            propertyName,
            // NOTE: VIEW2.0 doesn't have legendName for each `operator`
            // legendName: ""
            conditions: [
              ...condition.map(cond => {
                const legend = findLegendTitleByColor(cs, cond.color);
                const asLegend = !checkIsLegendAlreadyUsed(legend, cond.color);
                storeLegendCache(legend, cond.color);
                return {
                  id: generateID(),
                  operation: cond.condition.operator,
                  value: removeQuote(cond.condition.value.toString()),
                  color: cond.color,
                  asLegend,
                  legendName: legend,
                };
              }),
              // Default style
              ...(() => {
                if (!isFirstItemDefault || !firstDefaultItem) return [];
                const legend = findLegendTitleByColor(cs, firstDefaultItem.color);
                return [
                  {
                    id: generateID(),
                    operation: "!==" as const,
                    value: removeQuote(condition[0].condition.value.toString()),
                    color: firstDefaultItem.color,
                    asLegend: !!legend,
                    legendName: legend,
                  },
                ];
              })(),
            ],
          };
        }),
      },
    };
  },
  pointColorGradient: c => {
    return {
      type: POINT_FILL_COLOR_GRADIENT_FIELD,
      preset: {
        rules: [
          {
            id: generateID(),
            propertyName: c.field,
            max: c.max,
            min: c.min,
            colorMapName: "Plateau",
          },
        ],
      },
    };
  },
  pointSize: c => {
    return {
      type: POINT_SIZE_FIELD,
      preset: {
        defaultValue: c.pointSize,
      },
    };
  },
  pointIcon: c => {
    return [
      {
        type: POINT_USE_IMAGE_VALUE_FIELD,
        preset: {
          imageURL: c.url,
        },
      },
      {
        type: POINT_IMAGE_SIZE_FIELD,
        preset: {
          defaultValue: c.size,
          enableSizeInMeters: c.sizeInMeters,
        },
      },
    ];
  },
  pointLabel: c => {
    return {
      type: POINT_USE_LABEL_FIELD,
      textExpression: c.field,
      fontSize: c.fontSize,
      fontColor: c.fontColor,
      height: c.height,
      extruded: c.extruded,
      background: c.useBackground,
      backgroundColor: c.backgroundColor,
    };
  },
  pointModel: c => {
    return {
      type: POINT_USE_3D_MODEL,
      preset: {
        url: c.modelURL,
        size: c.scale,
      },
    };
  },
  pointStroke: c => {
    const stroke = c.items?.[0]; // It should be used only first condition.
    return {
      type: POINT_STROKE_FIELD,
      preset: {
        color: stroke?.strokeColor,
        width: stroke?.strokeWidth,
      },
    };
  },
  pointCSV: c => {
    return {
      type: POINT_CONVERT_FROM_CSV,
      lngColumn: c.lng,
      latColumn: c.lat,
      heightColumn: c.height,
    };
  },
  // polyline
  polylineColor: (c, cs) => {
    if (c.items?.length === 1 && checkIsSingleValue(c.items[0].condition)) {
      return {
        type: POLYLINE_FILL_COLOR_VALUE_FIELD,
        preset: makeColorField(cs, c.items[0].color),
      };
    }
    const isFirstItemDefault =
      c.items?.[0].condition.operand === "true" ||
      (c.items?.[0].condition.operand as unknown as boolean) === true;
    const firstDefaultItem = c.items?.[0];

    const conditionGroup = Object.entries(
      groupBy(c.items?.slice(isFirstItemDefault ? 1 : 0), v => v.condition.operand),
    );

    const legendCache: Record<string, string> = {};
    const storeLegendCache = (legend: string | undefined, color: string) =>
      legend && (legendCache[legend] = color);
    const checkIsLegendAlreadyUsed = (legend: string | undefined, color: string) =>
      !!(legend && legendCache[legend] && legendCache[legend] === color);

    return {
      type: POLYLINE_FILL_COLOR_CONDITION_FIELD,
      preset: {
        rules: conditionGroup.map(([operand, condition]) => {
          const propertyName = getPropertyName(operand);
          return {
            id: generateID(),
            propertyName,
            // NOTE: VIEW2.0 doesn't have legendName for each `operator`
            // legendName: ""
            conditions: [
              ...condition.map(cond => {
                const legend = findLegendTitleByColor(cs, cond.color);
                const asLegend = !checkIsLegendAlreadyUsed(legend, cond.color);
                storeLegendCache(legend, cond.color);
                return {
                  id: generateID(),
                  operation: cond.condition.operator,
                  value: removeQuote(cond.condition.value.toString()),
                  color: cond.color,
                  asLegend,
                  legendName: legend,
                };
              }),
              // Default style
              ...(() => {
                if (!isFirstItemDefault || !firstDefaultItem) return [];
                const legend = findLegendTitleByColor(cs, firstDefaultItem.color);
                return [
                  {
                    id: generateID(),
                    operation: "!==" as const,
                    value: removeQuote(condition[0].condition.value.toString()),
                    color: firstDefaultItem.color,
                    asLegend: !!legend,
                    legendName: legend,
                  },
                ];
              })(),
            ],
          };
        }),
      },
    };
  },
  polylineStrokeWeight: c => {
    return {
      type: POLYLINE_STROKE_WEIGHT_FIELD,
      preset: {
        defaultValue: c.strokeWidth,
      },
    };
  },
  polylineClassificationType: c => {
    return {
      type: POLYLINE_CLASSIFICATION_TYPE_FIELD,
      preset: {
        defaultValue: c.classificationType,
      },
    };
  },
  // polygon
  polygonColor: (c, cs) => {
    if (c.items?.length === 1 && checkIsSingleValue(c.items[0].condition)) {
      return {
        type: POLYGON_FILL_COLOR_VALUE_FIELD,
        preset: makeColorField(cs, c.items[0].color),
      };
    }
    const isFirstItemDefault =
      c.items?.[0].condition.operand === "true" ||
      (c.items?.[0].condition.operand as unknown as boolean) === true;
    const firstDefaultItem = c.items?.[0];

    const conditionGroup = Object.entries(
      groupBy(c.items?.slice(isFirstItemDefault ? 1 : 0), v => v.condition.operand),
    );

    const legendCache: Record<string, string> = {};
    const storeLegendCache = (legend: string | undefined, color: string) =>
      legend && (legendCache[legend] = color);
    const checkIsLegendAlreadyUsed = (legend: string | undefined, color: string) =>
      !!(legend && legendCache[legend] && legendCache[legend] === color);

    return {
      type: POLYGON_FILL_COLOR_CONDITION_FIELD,
      preset: {
        rules: conditionGroup.map(([operand, condition]) => {
          const propertyName = getPropertyName(operand);
          return {
            id: generateID(),
            propertyName,
            // NOTE: VIEW2.0 doesn't have legendName for each `operator`
            // legendName: ""
            conditions: [
              ...condition.map(cond => {
                const legend = findLegendTitleByColor(cs, cond.color);
                const asLegend = !checkIsLegendAlreadyUsed(legend, cond.color);
                storeLegendCache(legend, cond.color);
                return {
                  id: generateID(),
                  operation: cond.condition.operator,
                  value: removeQuote(cond.condition.value.toString()),
                  color: cond.color,
                  asLegend,
                  legendName: legend,
                };
              }),
              // Default style
              ...(() => {
                if (!isFirstItemDefault || !firstDefaultItem) return [];
                const legend = findLegendTitleByColor(cs, firstDefaultItem.color);
                return [
                  {
                    id: generateID(),
                    operation: "!==" as const,
                    value: removeQuote(condition[0].condition.value.toString()),
                    color: firstDefaultItem.color,
                    asLegend: !!legend,
                    legendName: legend,
                  },
                ];
              })(),
            ],
          };
        }),
      },
    };
  },
  polygonStroke: c => {
    const stroke = c.items?.[0]; // It should be used only first condition.
    return [
      {
        type: POLYGON_STROKE_WEIGHT_FIELD,
        preset: {
          defaultValue: stroke?.strokeWidth,
        },
      },
      {
        type: POLYGON_STROKE_COLOR_FIELD,
        preset: {
          defaultValue: stroke?.strokeColor,
        },
      },
    ];
  },
  polygonClassificationType: c => {
    return {
      type: POLYGON_CLASSIFICATION_TYPE_FIELD,
      preset: {
        defaultValue: c.classificationType,
      },
    };
  },
  // 3d-model
  // 3d-tile
  clipping: () => {
    return {
      type: TILESET_CLIPPING,
    };
  },
  buildingFilter: () => {
    return {
      type: TILESET_BUILDING_MODEL_FILTER,
    };
  },
  buildingTransparency: () => {
    return {
      type: OPACITY_FIELD,
    };
  },
  buildingColor: () => {
    return {
      type: TILESET_BUILDING_MODEL_COLOR,
    };
  },
  floodColor: () => {
    return {
      type: TILESET_FLOOD_MODEL_COLOR,
    };
  },
  floodFilter: () => {
    return {
      type: TILESET_FLOOD_MODEL_FILTER,
    };
  },
};

export const CORRESPONDING_COMPONENT = {
  // general
  description: LAYER_DESCRIPTION_FIELD,
  styleCode: STYLE_CODE_FIELD,
  buttonLink: LINK_BUTTON_FIELD,
  story: DATASET_STORY_FIELD,
  currentTime: TIMELINE_CUSTOMIZED_FIELD,
  switchVisibility: [
    POINT_VISIBILITY_FILTER_FIELD,
    POLYLINE_VISIBILITY_FILTER_FIELD,
    POLYGON_VISIBILITY_FILTER_FIELD,
  ],
  heightReference: [
    POINT_HEIGHT_REFERENCE_FIELD,
    POLYLINE_HEIGHT_REFERENCE_FIELD,
    POLYGON_HEIGHT_REFERENCE_FIELD,
  ],
  timeline: APPLY_TIME_VALUE_FIELD,
  // point
  pointColor: [POINT_FILL_COLOR_CONDITION_FIELD, POINT_FILL_COLOR_VALUE_FIELD],
  pointColorGradient: POINT_FILL_COLOR_GRADIENT_FIELD,
  pointSize: POINT_SIZE_FIELD,
  pointIcon: [POINT_USE_IMAGE_VALUE_FIELD, POINT_IMAGE_SIZE_FIELD],
  pointLabel: POINT_USE_LABEL_FIELD,
  pointModel: POINT_USE_3D_MODEL,
  pointStroke: POINT_STROKE_FIELD,
  pointCSV: POINT_CONVERT_FROM_CSV,
  // polyline
  polylineColor: [POLYLINE_FILL_COLOR_VALUE_FIELD, POLYLINE_FILL_COLOR_CONDITION_FIELD],
  polylineStrokeWeight: POLYLINE_STROKE_WEIGHT_FIELD,
  polylineClassificationType: POLYLINE_CLASSIFICATION_TYPE_FIELD,
  // polygon
  polygonColor: [POLYGON_FILL_COLOR_VALUE_FIELD, POLYGON_FILL_COLOR_CONDITION_FIELD],
  polygonStroke: [POLYGON_STROKE_WEIGHT_FIELD, POLYGON_STROKE_COLOR_FIELD],
  polygonClassificationType: POLYGON_CLASSIFICATION_TYPE_FIELD,
  // 3d-model
  // 3d-tile
  clipping: TILESET_CLIPPING,
  buildingFilter: TILESET_BUILDING_MODEL_FILTER,
  buildingTransparency: OPACITY_FIELD,
  buildingColor: TILESET_BUILDING_MODEL_COLOR,
  floodColor: TILESET_FLOOD_MODEL_COLOR,
  floodFilter: TILESET_FLOOD_MODEL_FILTER,
} satisfies {
  [K in ConvertableComponent]:
    | View3ComponentGroup["components"][number]["type"]
    | View3ComponentGroup["components"][number]["type"][]
    | undefined;
};
