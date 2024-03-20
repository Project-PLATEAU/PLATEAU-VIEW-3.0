import { atom, useAtomValue, type PrimitiveAtom, useSetAtom } from "jotai";
import { splitAtom } from "jotai/utils";
import { useCallback, type FC } from "react";

import { type LayerProps } from "../layers";
import { Sketch } from "../sketch";
import { type SketchFeature } from "../sketch";
import { type SplitAtom } from "../type-helpers";

import {
  createViewLayerModel,
  type ViewLayerModel,
  type ViewLayerModelParams,
} from "./createViewLayerModel";
import { SKETCH_LAYER } from "./layerTypes";
import { type ConfigurableLayerModel } from "./types";

let nextLayerIndex = 1;

export interface SketchLayerModelParams extends ViewLayerModelParams {
  features?: readonly SketchFeature[];
}

export interface SketchLayerModel extends ViewLayerModel {
  title: string;
  featuresAtom: PrimitiveAtom<SketchFeature[]>;
  featureAtomsAtom: SplitAtom<SketchFeature>;
}

export type SharedSketchLayer = {
  type: "sketch";
  id: string;
  title: string;
  features: SketchFeature[];
};

export function createSketchLayer(
  params: SketchLayerModelParams,
): ConfigurableLayerModel<SketchLayerModel> {
  const featuresAtom = atom<SketchFeature[]>([...(params.features ?? [])]);
  const title = `作図${nextLayerIndex++}`;
  return {
    ...createViewLayerModel({
      ...params,
      // TODO: Avoid side-effect
      title,
    }),
    title,
    type: SKETCH_LAYER,
    featuresAtom,
    featureAtomsAtom: splitAtom(featuresAtom),
  };
}

export const SketchLayer: FC<LayerProps<typeof SKETCH_LAYER>> = ({
  featuresAtom,
  hiddenAtom,
  layerIdAtom,
}) => {
  const hidden = useAtomValue(hiddenAtom);

  const setLayerId = useSetAtom(layerIdAtom);
  const handleLoad = useCallback(
    (layerId: string) => {
      setLayerId(layerId);
    },
    [setLayerId],
  );

  if (hidden) {
    return null;
  }
  return <Sketch featuresAtom={featuresAtom} onLoad={handleLoad} />;
};
