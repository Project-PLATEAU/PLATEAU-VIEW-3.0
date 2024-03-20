import { Atom, PrimitiveAtom, WritableAtom } from "jotai";
import { type SetOptional } from "type-fest";

import { type LayerModelBase } from "../../prototypes/layers";
import { LayerModelOverrides as ReEarthLayerModelOverrides } from "../../shared/view-layers";
import {
  type ImageIconSet,
  type QualitativeColorSet,
  type QuantitativeColorMap,
} from "../datasets";
import { type LayerListItemProps } from "../ui-components";

export type ConfigurableLayerModel<T extends LayerModelBase> = SetOptional<T, "id">;

export type ConfigurableLayerModelBase<T extends LayerModelBase> = Omit<
  ConfigurableLayerModel<T>,
  "type"
>;

export type LayerTitle = LayerListItemProps["title"];

export type LayerColorScheme = QuantitativeColorMap | QualitativeColorSet;

export type LayerImageScheme = ImageIconSet;

declare module "../layers" {
  interface LayerModelBase {
    titleAtom: PrimitiveAtom<LayerTitle | null>;
    loadingAtom: PrimitiveAtom<boolean>;
    hiddenAtom: PrimitiveAtom<boolean>;
    // NOTE: Use layerId instead of boundingSphereAtom for ReEarth
    layerIdAtom: WritableAtom<string | null, [string | null], any>;
    colorSchemeAtom: Atom<LayerColorScheme | null>;
    imageSchemeAtom: Atom<LayerImageScheme | null>;
  }

  interface LayerModelOverrides extends ReEarthLayerModelOverrides {}
}
