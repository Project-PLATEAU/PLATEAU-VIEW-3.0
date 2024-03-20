import { useTheme } from "@mui/material";
import { PrimitiveAtom, WritableAtom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useMemo } from "react";

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
import {
  TILESET_FLOOD_MODEL_COLOR,
  TILESET_FLOOD_MODEL_FILTER,
} from "../types/fieldComponents/3dtiles";
import { OPACITY_FIELD } from "../types/fieldComponents/general";
import { ComponentAtom } from "../view-layers/component";
import { useFindComponent } from "../view-layers/hooks";

import { useEvaluateFeatureColor } from "./hooks/useEvaluateFeatureColor";
import { useEvaluateFilter } from "./hooks/useEvaluateFilter";

type TilesetContainerProps = Omit<TilesetProps, "appearance" | "boxAppearance"> & {
  id: string;
  featureIndexAtom: PrimitiveAtom<TileFeatureIndex | null>;
  layerIdAtom: WritableAtom<string | null, [string | null], any>;
  propertiesAtom: WritableAtom<PlateauTilesetProperties | null, [PlateauTilesetProperties | null], any>;
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

  const setProperties = useSetAtom(propertiesAtom);
  const handleLoad = useCallback(
    (layerId: string) => {
      onLoad?.(layerId);
      setLayerId(layerId);
      setFeatureIndex(new TileFeatureIndex(layerId));
      setProperties(new PlateauTilesetProperties(layerId));
    },
    [onLoad, setFeatureIndex, setProperties, setLayerId],
  );

  const colorProperty = useAtomValue(colorPropertyAtom);
  const colorScheme = useAtomValue(colorSchemeAtom);

  // Field components
  const opacityAtom = useFindComponent(componentAtoms, OPACITY_FIELD);
  const floodModelColorAtom = useFindComponent(componentAtoms, TILESET_FLOOD_MODEL_COLOR);

  const filter = useEvaluateFilter(
    useOptionalAtomValue(useFindComponent(componentAtoms, TILESET_FLOOD_MODEL_FILTER)),
  );

  const opacity = useOptionalAtomValue(opacityAtom);
  const color = useEvaluateFeatureColor({
    colorProperty: floodModelColorAtom ? colorProperty ?? undefined : undefined,
    colorScheme: floodModelColorAtom ? colorScheme ?? undefined : undefined,
    opacity: opacity?.value,
    selections,
  });

  const theme = useTheme();

  const appearance: LayerAppearance<Cesium3DTilesAppearance> = useMemo(
    () => ({
      pbr: !colorProperty,
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
    }),
    [color, theme.palette.primary.main, filter, colorProperty],
  );

  return <TilesetLayer {...props} onLoad={handleLoad} appearance={appearance} visible={!hidden} />;
};
