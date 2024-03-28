import { useTheme } from "@mui/material";
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useMemo, useRef } from "react";

import { ColorMap } from "../../prototypes/color-maps";
import {
  ScreenSpaceSelectionEntry,
  useScreenSpaceSelectionResponder,
} from "../../prototypes/screen-space-selection";
import { ViewLayerModel } from "../../prototypes/view-layers";
import { useOptionalAtomValue } from "../hooks";
import { PlateauTilesetProperties, TileFeatureIndex } from "../plateau";
import { TILESET_FEATURE, TilesetLayer, TilesetProps } from "../reearth/layers";
import { Cesium3DTilesAppearance, LayerAppearance } from "../reearth/types";
import { getSharedStoreValue } from "../sharedAtoms";
import { SHARED_PROJECT_ID, SHARED_PROJECT_ID_KEY } from "../states/share";
import {
  TILESET_FLOOD_COLOR_FIELD,
  TILESET_FLOOD_MODEL_COLOR,
  TILESET_FLOOD_MODEL_FILTER,
  TILESET_DISABLE_DEFAULT_MATERIAL,
  TILESET_APPLY_EMPTY_SHC,
} from "../types/fieldComponents/3dtiles";
import { OPACITY_FIELD } from "../types/fieldComponents/general";
import { hexToRGBArray } from "../utils";
import { ComponentAtom } from "../view-layers/component";
import { useFindComponent } from "../view-layers/hooks";

import { useEvaluateFeatureColor } from "./hooks/useEvaluateFeatureColor";
import { useEvaluateFilter } from "./hooks/useEvaluateFilter";

type TilesetContainerProps = Omit<TilesetProps, "appearance" | "boxAppearance"> & {
  id: string;
  featureIndexAtom: PrimitiveAtom<TileFeatureIndex | null>;
  layerIdAtom: PrimitiveAtom<string | null>;
  propertiesAtom: PrimitiveAtom<PlateauTilesetProperties | null>;
  colorPropertyAtom: PrimitiveAtom<string | null>;
  colorMapAtom: PrimitiveAtom<ColorMap>;
  colorRangeAtom: PrimitiveAtom<number[]>;
  colorSchemeAtom: ViewLayerModel["colorSchemeAtom"];
  selections?: ScreenSpaceSelectionEntry<typeof TILESET_FEATURE>[];
  hidden: boolean;
  componentAtoms: ComponentAtom[];
};

export const FloodModelLayerContainer: FC<TilesetContainerProps> = ({
  id,
  onLoad,
  layerIdAtom,
  featureIndexAtom,
  propertiesAtom,
  colorPropertyAtom,
  colorSchemeAtom,
  componentAtoms,
  selections,
  hidden,
  ...props
}) => {
  const [featureIndex, setFeatureIndex] = useAtom(featureIndexAtom);
  const [layerId, setLayerId] = useAtom(layerIdAtom);
  useScreenSpaceSelectionResponder({
    type: TILESET_FEATURE,
    convertToSelection: object => {
      return "id" in object &&
        typeof object.id === "string" &&
        featureIndex &&
        layerId &&
        "layerId" in object &&
        object.layerId === layerId
        ? {
            type: TILESET_FEATURE,
            value: {
              key: object.id,
              layerId,
              featureIndex,
              datasetId: id,
            },
          }
        : undefined;
    },
    shouldRespondToSelection: (
      value,
    ): value is ScreenSpaceSelectionEntry<typeof TILESET_FEATURE> => {
      return value.type === TILESET_FEATURE && !!value.value && value.value.layerId === layerId;
    },
    onSelect: value => {
      if (featureIndex?.selectedFeatureIds.has(value.value.key)) {
        return;
      }
      featureIndex?.select([value.value.key]);
    },
    onDeselect: value => {
      if (!featureIndex?.selectedFeatureIds.has(value.value.key)) {
        return;
      }
      featureIndex?.unselect([value.value.key]);
    },
    // computeBoundingSphere: (value, result = new BoundingSphere()) => {
    //   computeCartographicToCartesian(scene, location, result.center);
    //   result.radius = 200; // Arbitrary size
    //   return result;
    // },
  });

  const floodColor = useOptionalAtomValue(
    useFindComponent<typeof TILESET_FLOOD_COLOR_FIELD>(componentAtoms, TILESET_FLOOD_COLOR_FIELD),
  );

  const setProperties = useSetAtom(propertiesAtom);
  const floodColorRef = useRef(floodColor);
  floodColorRef.current = floodColor;
  const handleLoad = useCallback(
    async (layerId: string) => {
      onLoad?.(layerId);
      setLayerId(layerId);
      setFeatureIndex(new TileFeatureIndex(layerId));
      const shareId =
        (await getSharedStoreValue<string>(SHARED_PROJECT_ID_KEY)) ?? SHARED_PROJECT_ID;
      setProperties(
        new PlateauTilesetProperties(layerId, { floodColor: floodColorRef.current, shareId }),
      );
    },
    [onLoad, setFeatureIndex, setProperties, setLayerId],
  );

  const colorProperty = useAtomValue(colorPropertyAtom);
  const colorScheme = useAtomValue(colorSchemeAtom);

  const disableDefaultMaterialAtom = useFindComponent(
    componentAtoms,
    TILESET_DISABLE_DEFAULT_MATERIAL,
  );

  const applyEmptySHCAtom = useFindComponent(componentAtoms, TILESET_APPLY_EMPTY_SHC);

  // Field components
  const opacityAtom = useFindComponent(componentAtoms, OPACITY_FIELD);
  const floodModelColorAtom = useFindComponent(componentAtoms, TILESET_FLOOD_MODEL_COLOR);

  const filter = useEvaluateFilter(
    useOptionalAtomValue(useFindComponent(componentAtoms, TILESET_FLOOD_MODEL_FILTER)),
  );

  const disableDefaultMaterial = useOptionalAtomValue(disableDefaultMaterialAtom);
  const applyEmptySHC = useOptionalAtomValue(applyEmptySHCAtom);
  const theme = useTheme();

  const primaryRGB = useMemo(() => hexToRGBArray(theme.palette.primary.main), [theme]);

  const opacity = useOptionalAtomValue(opacityAtom);
  const color = useEvaluateFeatureColor({
    colorProperty: floodModelColorAtom || floodColor ? colorProperty ?? undefined : undefined,
    colorScheme: floodModelColorAtom || floodColor ? colorScheme ?? undefined : undefined,
    opacity: opacity?.value ?? opacity?.preset?.defaultValue,
    selections,
    defaultColor: {
      r: primaryRGB[0],
      g: primaryRGB[1],
      b: primaryRGB[2],
      a: 1,
    },
  });

  const appearance: LayerAppearance<Cesium3DTilesAppearance> = useMemo(
    () => ({
      pbr: disableDefaultMaterial ? false : colorProperty ? false : "withTexture",
      ...(color
        ? {
            color: {
              expression: color,
            },
          }
        : {}),
      show: {
        expression: filter,
      },
      shadows: "disabled",
      selectedFeatureColor: theme.palette.primary.main,
      ...(applyEmptySHC ? { sphericalHarmonicCoefficients: [] } : {}),
    }),
    [
      color,
      colorProperty,
      theme.palette.primary.main,
      filter,
      disableDefaultMaterial,
      applyEmptySHC,
    ],
  );

  return (
    <TilesetLayer
      {...props}
      noId // Flood model doesn't have id, so we can't cache each feature
      onLoad={handleLoad}
      appearance={appearance}
      visible={!hidden}
    />
  );
};
