import { atom, SetStateAction, type PrimitiveAtom, WritableAtom } from "jotai";

import {
  colorMapPlateau,
  ColorMap,
  ColorMapType,
  createColorMapFromType,
} from "../../../prototypes/color-maps";
import { type ViewLayerModel, type LayerColorScheme } from "../../../prototypes/view-layers";
import { type TileFeatureIndex } from "../../plateau";
import { PlateauTilesetProperties } from "../../plateau/layers";
import { ComponentIdParams, makeComponentAtomWrapper } from "../component";

export interface PlateauTilesetLayerStateParams extends Omit<ComponentIdParams, "componentType"> {
  hiddenFeatures?: readonly string[];
  shouldInitializeAtom?: boolean;
}

export type SearchedFeatures = {
  features: string[];
  conditions: [string, string[]][];
  onlyShow: boolean;
  highlight: boolean;
  selectedIndices: number[];
};

export interface PlateauTilesetLayerState {
  isPlateauTilesetLayer: true;
  featureIndexAtom: PrimitiveAtom<TileFeatureIndex | null>;
  hiddenFeaturesAtom: PrimitiveAtom<readonly string[] | null>;
  searchedFeaturesAtom: PrimitiveAtom<SearchedFeatures | null>;
  propertiesAtom: PrimitiveAtom<PlateauTilesetProperties | null>;
  colorPropertyAtom: PrimitiveAtom<string | null>;
  colorMapAtom: WritableAtom<ColorMap<ColorMapType>, [SetStateAction<ColorMap>], void>;
  colorRangeAtom: PrimitiveAtom<number[]>;
  colorSchemeAtom: ViewLayerModel["colorSchemeAtom"];
}

export function createPlateauTilesetLayerState(
  params: PlateauTilesetLayerStateParams,
): PlateauTilesetLayerState {
  const propertiesAtom = atom<PlateauTilesetProperties | null>(null);

  const colorPropertyAtom = makeComponentAtomWrapper(
    atom<string | null>(null),
    {
      ...params,
      componentType: "colorProperty",
    },
    false,
    { shouldInitialize: params.shouldInitializeAtom },
  );

  const originalColorMapAtom = atom<ColorMap>(colorMapPlateau);
  const wrappedOriginalColorMapAtom = atom(
    get => get(originalColorMapAtom),
    (get, set, colorMapAction: SetStateAction<ColorMap>) => {
      const colorMap =
        typeof colorMapAction === "function"
          ? colorMapAction(get(originalColorMapAtom))
          : colorMapAction;
      if (colorMap instanceof ColorMap) {
        set(originalColorMapAtom, colorMap);
        return;
      }
      const objectColorMap: unknown = colorMap;
      if (typeof objectColorMap === "string") {
        const colorMap = createColorMapFromType(objectColorMap);
        if (colorMap) {
          set(originalColorMapAtom, colorMap);
        }
      }
    },
  );

  const colorMapAtom = makeComponentAtomWrapper(
    wrappedOriginalColorMapAtom,
    { ...params, componentType: "colorMap" },
    true,
    {
      shouldInitialize: params.shouldInitializeAtom,
      beforeSet: a => (a instanceof ColorMap ? a.name : typeof a === "string" ? a : undefined),
    },
  );
  const colorRangeAtom = makeComponentAtomWrapper(
    atom([0, 100]),
    { ...params, componentType: "colorRange" },
    true,
    { shouldInitialize: params.shouldInitializeAtom },
  );
  const valueRangeAtom = atom(
    get => {
      const properties = get(propertiesAtom);
      const colorProperty = get(colorPropertyAtom);
      const property =
        colorProperty != null
          ? properties?.value?.find(({ accessor }) => accessor === colorProperty)
          : undefined;
      return property?.type === "number" ? [property.minimum, property.maximum] : [];
    },
    (_get, _set, _value: SetStateAction<number[]>) => {
      // Not writable
    },
  );

  const colorSchemeAtom = atom<LayerColorScheme | null>(get => {
    const properties = get(propertiesAtom);
    const colorProperty = get(colorPropertyAtom);
    if (colorProperty == null) {
      return null;
    }
    const property = properties?.value?.find(
      ({ name, accessor }) => name === colorProperty || accessor === colorProperty,
    );
    return property?.type === "qualitative"
      ? property.colorSet
      : {
          type: "quantitative",
          name: property?.displayName || colorProperty.replaceAll("_", " "),
          colorMapAtom,
          colorRangeAtom,
          valueRangeAtom,
        };
  });

  return {
    isPlateauTilesetLayer: true,
    featureIndexAtom: atom<TileFeatureIndex | null>(null),
    searchedFeaturesAtom: atom<SearchedFeatures | null>(null),
    hiddenFeaturesAtom: atom<readonly string[] | null>(params.hiddenFeatures ?? null),
    propertiesAtom,
    colorPropertyAtom,
    colorMapAtom,
    colorRangeAtom,
    colorSchemeAtom,
  };
}
