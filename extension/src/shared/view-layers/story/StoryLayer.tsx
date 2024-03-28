import { PrimitiveAtom, atom } from "jotai";
import { FC } from "react";

import { LayerProps } from "../../../prototypes/layers";
import {
  ConfigurableLayerModel,
  STORY_LAYER,
  ViewLayerModelParams,
  createViewLayerModel,
} from "../../../prototypes/view-layers";
import { CameraPosition } from "../../reearth/types";
import { LayerModel } from "../model";

export type StoryCapture = {
  id: string;
  title?: string;
  content?: string;
  camera: CameraPosition;
};

export interface StoryLayerModelParams extends ViewLayerModelParams {
  title: string;
  captures?: readonly StoryCapture[];
}

export type SharedStoryLayer = {
  type: "story";
  id: string;
  title: string;
  captures: StoryCapture[];
};

export interface StoryLayerModel extends LayerModel {
  title: string;
  capturesAtom: PrimitiveAtom<StoryCapture[]>;
}

export function createStoryLayer(
  params: StoryLayerModelParams,
): ConfigurableLayerModel<StoryLayerModel> {
  const capturesAtom = atom<StoryCapture[]>([...(params.captures ?? [])]);
  return {
    ...createViewLayerModel(params),
    type: STORY_LAYER,
    title: params.title,
    capturesAtom,
  };
}

export const StoryLayer: FC<LayerProps<typeof STORY_LAYER>> = () => {
  return null;
};
