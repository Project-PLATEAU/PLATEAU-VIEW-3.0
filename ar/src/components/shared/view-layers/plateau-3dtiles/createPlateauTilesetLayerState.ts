import { atom, SetStateAction, type PrimitiveAtom, WritableAtom } from "jotai";

import { colorMapPlateau, ColorMap, ColorMapType } from "../../../prototypes/color-maps";
import { type ViewLayerModel, type LayerColorScheme } from "../../../prototypes/view-layers";
import { type TileFeatureIndex } from "../../plateau";
import { PlateauTilesetProperties } from "../../plateau/layers";
import { ComponentIdParams, makeComponentAtomWrapper } from "../component";
import { Properties } from "../../reearth/utils";

export interface PlateauTilesetLayerStateParams extends Omit<ComponentIdParams, "componentType"> {
  hiddenFeatures?: readonly string[];
  shouldInitializeAtom?: boolean;
}

export type SearchedFeatures = {
  features: string[];
  onlyShow: boolean;
  highlight: boolean;
  selectedIndices: number[];
};

export interface PlateauTilesetLayerState {
  isPlateauTilesetLayer: true;
  featureIndexAtom: PrimitiveAtom<TileFeatureIndex | null>;
  hiddenFeaturesAtom: PrimitiveAtom<readonly string[] | null>;
  searchedFeaturesAtom: PrimitiveAtom<SearchedFeatures | null>;
  propertiesAtom: WritableAtom<PlateauTilesetProperties | null, [PlateauTilesetProperties | null], any>;
  colorPropertyAtom: PrimitiveAtom<string | null>;
  colorMapAtom: WritableAtom<ColorMap<ColorMapType>, [SetStateAction<ColorMap>], void>;
  colorRangeAtom: PrimitiveAtom<number[]>;
  colorSchemeAtom: ViewLayerModel["colorSchemeAtom"];
}

export function createPlateauTilesetLayerState(
  params: PlateauTilesetLayerStateParams,
): PlateauTilesetLayerState {
  const propertiesAtom = atom<PlateauTilesetProperties | null, any[], unknown>(null, null);

  const colorPropertyAtom = atom<string | null, any[], unknown>(null, null);

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
      const objectColorMap: any = colorMap;
      if (
        objectColorMap &&
        "type" in objectColorMap &&
        typeof objectColorMap.type === "string" &&
        "name" in objectColorMap &&
        typeof objectColorMap.name === "string" &&
        "lut" in objectColorMap &&
        objectColorMap.lut &&
        Array.isArray(objectColorMap.lut)
      ) {
        set(
          originalColorMapAtom,
          new ColorMap(objectColorMap.type, objectColorMap.name, objectColorMap.lut),
        );
      }
    },
  );

  const colorMapAtom = makeComponentAtomWrapper(
    wrappedOriginalColorMapAtom,
    { ...params, componentType: "colorMap" },
    true,
    params.shouldInitializeAtom,
  );
  const colorRangeAtom = makeComponentAtomWrapper(
    atom([0, 100]),
    { ...params, componentType: "colorRange" },
    true,
    params.shouldInitializeAtom,
  );
  const valueRangeAtom = atom(
    get => {
      const properties = get(propertiesAtom);
      const colorProperty = get(colorPropertyAtom);
      const property =
        colorProperty != null
          ? properties?.value?.find(({ name }) => name === colorProperty)
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
    const property = properties?.value?.find(({ name }) => name === colorProperty);
    return property?.type === "qualitative"
      ? property.colorSet
      : {
          type: "quantitative",
          name: colorProperty.replaceAll("_", " "),
          colorMapAtom,
          colorRangeAtom,
          valueRangeAtom,
        };
  });

  return {
    isPlateauTilesetLayer: true,
    featureIndexAtom: atom<TileFeatureIndex, any[], unknown>(null, null),
    searchedFeaturesAtom: atom<SearchedFeatures, any[], unknown>(null, null),
    hiddenFeaturesAtom: atom<readonly string[] | null>(params.hiddenFeatures ?? null),
    propertiesAtom,
    colorPropertyAtom,
    colorMapAtom,
    colorRangeAtom,
    colorSchemeAtom,
  };
}
