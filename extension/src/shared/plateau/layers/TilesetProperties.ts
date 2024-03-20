import {
  QualitativeColor,
  QualitativeColorSet,
  atomsWithQualitativeColorSet,
  usageColorSet,
  structureTypeColorSet,
  fireproofStructureTypeColorSet,
  steepSlopeRiskColorSet,
  mudflowRiskColorSet,
  landslideRiskColorSet,
  floodRankColorSet,
} from "../../../prototypes/datasets";
import { isNotNullish } from "../../../prototypes/type-helpers";
import { Properties } from "../../reearth/utils";
import { TilesetFloodColorField } from "../../types/fieldComponents/3dtiles";
import { BUILDING_FEATURE_TYPE } from "../constants";
import { makePropertyName } from "../featureInspector";

export type AvailableFeatures = ("color" | "buildingFilter" | "floodFilter")[];

interface QualitativeProperty {
  testProperty: (name: string, value: unknown) => boolean;
  colorSet?: QualitativeColorSet | ((id: string, name: string) => QualitativeColorSet);
  getDisplayName?: (name: string) => string;
  getMinMax?: (min: number, max: number) => [min: number, max: number];
  availableFeatures?: AvailableFeatures;
  isMinMaxNeeded?: boolean;
  isFlood?: boolean;
}

const qualitativeProperties: QualitativeProperty[] = [
  {
    testProperty: propertyName =>
      // For building layers
      propertyName.endsWith("浸水ランクコード") ||
      // For river flooding risk layers
      propertyName === "rank_code" ||
      propertyName === "uro:rank_code",
    colorSet: floodRankColorSet,
    getDisplayName: name =>
      name.endsWith("浸水ランクコード") ? name.replaceAll("_", " ") : "浸水ランク",
    availableFeatures: ["color", "floodFilter"],
    isMinMaxNeeded: true,
    isFlood: true,
  },
  {
    testProperty: propertyName =>
      // For building layers
      propertyName.endsWith("浸水ランクコード（独自）") ||
      // For river flooding risk layers
      propertyName === "rank_org_code" ||
      propertyName === "uro:rank_org_code" ||
      propertyName === "uro:rankOrg_code",
    colorSet: floodRankColorSet,
    getDisplayName: name =>
      name.endsWith("浸水ランクコード（独自）") ? name.replaceAll("_", " ") : "浸水ランク（独自）",
    availableFeatures: ["color", "floodFilter"],
    isMinMaxNeeded: true,
    isFlood: true,
  },
  {
    testProperty: propertyName => propertyName === "用途" || propertyName === "bldg:usage",
    getDisplayName: () => "用途",
    colorSet: usageColorSet,
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName =>
      propertyName === "構造種別" ||
      propertyName === "uro:BuildingDetailAttribute_uro:buildingStructureType",
    getDisplayName: () => "構造種別",
    colorSet: structureTypeColorSet,
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName =>
      propertyName === "耐火構造種別" ||
      propertyName === "uro:BuildingDetailAttribute_uro:fireproofStructureType",
    getDisplayName: () => "耐火構造種別",
    colorSet: fireproofStructureTypeColorSet,
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName => propertyName === "土砂災害リスク_急傾斜地の崩落_区域区分コード",
    colorSet: steepSlopeRiskColorSet,
    getDisplayName: () => "急傾斜地の崩落",
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName => propertyName === "土砂災害リスク_土石流_区域区分コード",
    colorSet: mudflowRiskColorSet,
    getDisplayName: () => "土石流",
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName => propertyName === "土砂災害リスク_地すべり_区域区分コード",
    colorSet: landslideRiskColorSet,
    getDisplayName: () => "地すべり",
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName =>
      propertyName === "建築年" || propertyName === "bldg:yearOfConstruction",
    availableFeatures: ["buildingFilter"],
    getMinMax: (min, max) => [Math.max(min, 1850), Math.min(max, new Date().getFullYear())],
  },
  {
    testProperty: propertyName => propertyName === "_lod",
    getDisplayName: () => "LOD",
    availableFeatures: ["buildingFilter"],
  },
];

interface NumberProperty {
  testProperty: (name: string, value: unknown) => boolean;
  getDisplayName?: (name: string) => string;
  getMinMax?: (min: number, max: number) => [min: number, max: number];
  availableFeatures?: AvailableFeatures;
  defaultValue?: number;
}

const numberProperties: NumberProperty[] = [
  {
    testProperty: propertyName =>
      propertyName === "計測高さ" || propertyName === "bldg:measuredHeight",
    availableFeatures: ["color", "buildingFilter"],
  },
  {
    testProperty: propertyName =>
      propertyName === "地上階数" || propertyName === "bldg:storeysAboveGround",
    availableFeatures: ["buildingFilter"],
  },
  {
    testProperty: propertyName =>
      propertyName === "地下階数" || propertyName === "bldg:storeysBelowGround",
    availableFeatures: ["buildingFilter"],
    getMinMax: (min, max) => [Math.min(min, 0), max],
    defaultValue: 0,
  },
];

export type PlateauTilesetProperty = {
  name: string;
  availableFeatures: AvailableFeatures;
  displayName: string;
  accessor: string;
  defaultValue?: number;
} & (
  | { type: "unknown" }
  | {
      type: "number";
      minimum: number;
      maximum: number;
    }
  | {
      type: "qualitative";
      colorSet: QualitativeColorSet;
      minimum?: number;
      maximum?: number;
    }
);

const makeAccessor = (propertyName: string) => `rootProperties["${propertyName}"]`;
export const restoreAccessor = (propertyName: string) =>
  propertyName.slice(`rootProperties["`.length, -`"]`.length);

export class PlateauTilesetProperties extends Properties {
  private _cachedComputedProperties: any;
  private _floodColors: QualitativeColor[] | undefined;
  private _shareId: string | undefined;

  constructor(
    layerId: string,
    { floodColor, shareId }: { floodColor?: TilesetFloodColorField; shareId?: string } = {},
  ) {
    super(layerId);
    this._floodColors = floodColor?.preset?.conditions
      ?.map(c =>
        c.legendName && c.color && c.rank
          ? {
              name: c.legendName,
              color: c.color,
              value: c.rank,
            }
          : undefined,
      )
      .filter(isNotNullish);
    this._shareId = shareId;
  }

  get value(): PlateauTilesetProperty[] | undefined {
    if (this._cachedComputedProperties) {
      return this._cachedComputedProperties;
    }
    const properties = super.value;
    if (!properties) return;

    this._cachedComputedProperties = Object.entries(properties)
      .map(([name, value]) => {
        if (value == null || typeof value !== "object") {
          return undefined;
        }

        const minimum =
          "minimum" in value && typeof value.minimum === "number" ? value.minimum : undefined;
        const maximum =
          "maximum" in value && typeof value.maximum === "number" ? value.maximum : undefined;

        // TODO: Support qualitative properties of non-number type if there
        // are any.
        const qualitativeProperty = qualitativeProperties?.find(({ testProperty }) =>
          testProperty(name, value),
        );
        const hasMinMaxForNeededCase =
          !qualitativeProperty?.isMinMaxNeeded || (minimum != null && maximum != null);
        if (qualitativeProperty != null && hasMinMaxForNeededCase) {
          const [finalMinimum, finalMaximum] =
            minimum && maximum
              ? qualitativeProperty?.getMinMax?.(minimum, maximum) ?? [minimum, maximum]
              : [];
          const displayName =
            qualitativeProperty.getDisplayName?.(name) ??
            makePropertyName(`${BUILDING_FEATURE_TYPE}_${name}`, name) ??
            name;
          return {
            name,
            type: "qualitative" as const,
            colorSet: !this._floodColors
              ? typeof qualitativeProperty.colorSet === "function"
                ? qualitativeProperty.colorSet(`${displayName}_${this._shareId}`, displayName)
                : qualitativeProperty.colorSet
              : atomsWithQualitativeColorSet({
                  id: `${displayName}_component_${this._shareId}`,
                  name: displayName,
                  colors: this._floodColors,
                }),
            minimum: finalMinimum,
            maximum: finalMaximum,
            displayName,
            availableFeatures: qualitativeProperty.availableFeatures,
            accessor: makeAccessor(name),
          };
        }

        if (minimum != null && maximum != null) {
          const numberProperty = numberProperties?.find(({ testProperty }) =>
            testProperty(name, value),
          );
          const [finalMinimum, finalMaximum] = numberProperty?.getMinMax?.(minimum, maximum) ?? [
            minimum,
            maximum,
          ];
          if (numberProperty != null) {
            return {
              name,
              type: "number" as const,
              minimum: finalMinimum,
              maximum: finalMaximum,
              displayName:
                numberProperty.getDisplayName?.(name) ??
                makePropertyName(`${BUILDING_FEATURE_TYPE}_${name}`, name) ??
                name,
              availableFeatures: numberProperty.availableFeatures,
              accessor: makeAccessor(name),
              defaultValue: numberProperty.defaultValue,
            };
          }
        }
        return {
          name,
          type: "unknown" as const,
        };
      })
      .filter(isNotNullish);
    return this._cachedComputedProperties;
  }
}
