import { atom } from "jotai";

import { XYZ } from "../../shared/reearth/types";
import { LayerModelBase } from "../layers";

import {
  type LayerImageScheme,
  type ConfigurableLayerModelBase,
  type LayerColorScheme,
  type LayerTitle,
  LayerCustomLegendScheme,
} from "./types";

export interface ViewLayerModelParams {
  id?: string;
  title?: string;
  hidden?: boolean;
  colorScheme?: LayerColorScheme;
  imageScheme?: LayerImageScheme;
  customLegendScheme?: LayerCustomLegendScheme;
}

export interface ViewLayerModel extends LayerModelBase {
  isViewLayer: true;
}

export function createViewLayerModel(
  params: ViewLayerModelParams,
): ConfigurableLayerModelBase<ViewLayerModel> {
  return {
    id: params.id,
    handleRef: {},
    isViewLayer: true,
    titleAtom: atom<LayerTitle | null>(params.title ?? null),
    loadingAtom: atom(false),
    hiddenAtom: atom(!!params.hidden),
    layerIdAtom: atom<string | null>(null),
    boundingSphereAtom: atom<XYZ | null>(null),
    colorSchemeAtom: atom<LayerColorScheme | null>(params.colorScheme ?? null),
    imageSchemeAtom: atom<LayerImageScheme | null>(params.imageScheme ?? null),
    customLegendSchemeAtom: atom<LayerCustomLegendScheme | null>(params.customLegendScheme ?? null),
  };
}
