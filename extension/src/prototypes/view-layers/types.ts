import { Atom, PrimitiveAtom } from "jotai";
import { type SetOptional } from "type-fest";

import { type LayerModelBase } from "../../prototypes/layers";
import { XYZ } from "../../shared/reearth/types";
import { LayerModelOverrides as ReEarthLayerModelOverrides } from "../../shared/view-layers";
import {
  type CustomLegendSet,
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

export type LayerCustomLegendScheme = CustomLegendSet;

declare module "../layers" {
  interface LayerModelBase {
    titleAtom: PrimitiveAtom<LayerTitle | null>;
    loadingAtom: PrimitiveAtom<boolean>;
    hiddenAtom: PrimitiveAtom<boolean>;
    boundingSphereAtom: PrimitiveAtom<XYZ | null>;
    // NOTE: Use layerId instead of boundingSphereAtom for ReEarth
    layerIdAtom: PrimitiveAtom<string | null>;
    colorSchemeAtom: Atom<LayerColorScheme | null>;
    imageSchemeAtom: Atom<LayerImageScheme | null>;
    customLegendSchemeAtom: Atom<LayerCustomLegendScheme | null>;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface LayerModelOverrides extends ReEarthLayerModelOverrides {}
}
