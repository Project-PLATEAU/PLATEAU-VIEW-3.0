import { QualitativeColorSet, floodRankColorSet } from "../../../prototypes/datasets";
import { isNotNullish } from "../../../prototypes/type-helpers";
import { Properties } from "../../reearth/utils";

interface QualitativeProperty {
  testProperty: (name: string, value: unknown) => boolean;
  colorSet: QualitativeColorSet;
}

const qualitativeProperties: QualitativeProperty[] = [
  {
    testProperty: propertyName =>
      // For building layers
      propertyName.endsWith("浸水ランク") ||
      // For river flooding risk layers
      propertyName === "rank_code" ||
      propertyName === "rank_org_code",
    colorSet: floodRankColorSet,
  },
];

export type PlateauTilesetProperty = { name: string } & (
  | { type: "unknown" }
  | {
      type: "number";
      minimum: number;
      maximum: number;
    }
  | {
      type: "qualitative";
      colorSet: QualitativeColorSet;
      minimum: number;
      maximum: number;
    }
);

export class PlateauTilesetProperties extends Properties {
  private _cachedComputedProperties: any;
  get value(): PlateauTilesetProperty[] | undefined {
    if (this._cachedComputedProperties) {
      return this._cachedComputedProperties;
    }
    const properties = super.value;
    if (!properties) return;

    this._cachedComputedProperties = Object.entries(properties)
      .map(([name, value]) => {
        if (name.startsWith("_") || value == null || typeof value !== "object") {
          return undefined;
        }
        if (
          "minimum" in value &&
          "maximum" in value &&
          typeof value.minimum === "number" &&
          typeof value.maximum === "number"
        ) {
          // TODO: Support qualitative properties of non-number type if there
          // are any.
          const qualitativeProperty = qualitativeProperties?.find(({ testProperty }) =>
            testProperty(name, value),
          );
          if (qualitativeProperty != null) {
            return {
              name,
              type: "qualitative" as const,
              colorSet: qualitativeProperty.colorSet,
              minimum: value.minimum,
              maximum: value.maximum,
            };
          }
          return {
            name,
            type: "number" as const,
            minimum: value.minimum,
            maximum: value.maximum,
          };
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
