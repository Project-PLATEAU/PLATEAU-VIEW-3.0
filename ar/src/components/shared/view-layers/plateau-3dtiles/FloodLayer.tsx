import { useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useEffect } from "react";

import type { LayerProps } from "../../../prototypes/layers";
import { ScreenSpaceSelectionEntry } from "../../../prototypes/screen-space-selection";
import { createViewLayerModel, ConfigurableLayerModel } from "../../../prototypes/view-layers";
import { FloodModelLayerContainer } from "../../layerContainers/floodModel";
import { TILESET_FEATURE } from "../../reearth/layers";
import { LayerModel, LayerModelParams } from "../model";

import {
  PlateauTilesetLayerState,
  PlateauTilesetLayerStateParams,
  createPlateauTilesetLayerState,
} from "./createPlateauTilesetLayerState";
import { FloodLayerType } from "./types";

export interface FloodLayerModelParams extends LayerModelParams, PlateauTilesetLayerStateParams {
  title: string;
  type: FloodLayerType;
  municipalityCode: string;
}

export interface FloodLayerModel extends LayerModel, PlateauTilesetLayerState {
  title: string;
  municipalityCode: string;
}

export function createFloodLayer(
  params: FloodLayerModelParams,
): ConfigurableLayerModel<FloodLayerModel> {
  return {
    ...createViewLayerModel(params),
    ...createPlateauTilesetLayerState(params),
    type: params.type,
    title: params.title,
    municipalityCode: params.municipalityCode,
  };
}

export const FloodLayer: FC<LayerProps<FloodLayerType>> = ({
  id,
  format,
  url,
  title,
  titleAtom,
  hiddenAtom,
  layerIdAtom,
  featureIndexAtom,
  selections,
  // hiddenFeaturesAtom,
  propertiesAtom,
  colorPropertyAtom,
  colorSchemeAtom,
  colorMapAtom,
  colorRangeAtom,
  componentAtoms,
  // showWireframeAtom,
}) => {
  const hidden = useAtomValue(hiddenAtom);

  const setLayerId = useSetAtom(layerIdAtom);
  const handleLoad = useCallback(
    (layerId: string) => {
      setLayerId(layerId);
    },
    [setLayerId],
  );

  const setTitle = useSetAtom(titleAtom);
  useEffect(() => {
    setTitle(title ?? null);
  }, [title, setTitle]);

  if (!url) {
    return null;
  }
  if (format === "3dtiles") {
    return (
      <FloodModelLayerContainer
        id={id}
        url={url}
        onLoad={handleLoad}
        layerIdAtom={layerIdAtom}
        hidden={hidden}
        // component={PlateauBuildingTileset}
        featureIndexAtom={featureIndexAtom}
        // hiddenFeaturesAtom={hiddenFeaturesAtom}
        propertiesAtom={propertiesAtom}
        colorPropertyAtom={colorPropertyAtom}
        colorSchemeAtom={colorSchemeAtom}
        colorMapAtom={colorMapAtom}
        colorRangeAtom={colorRangeAtom}
        selections={selections as ScreenSpaceSelectionEntry<typeof TILESET_FEATURE>[]}
        // Field components
        componentAtoms={componentAtoms ?? []}
      />
    );
  }
  return null;
};
