import { FC, useMemo } from "react";

import { StoryCapture } from "../../layerContainers/story";
import { useLayer } from "../hooks";
import { Data, LayerAppearanceTypes } from "../types";

export type StoryAppearance = Partial<Pick<LayerAppearanceTypes, "marker">>;

export type StoryProps = {
  id: string;
  capture: StoryCapture;
  appearances: StoryAppearance;
  visible?: boolean;
  onLoad?: (layerId: string) => void;
};

export const STORY_MARKER_ID_PROPERTY = "storyCaptureID";

export const StoryLayer: FC<StoryProps> = ({ id, capture, appearances, visible, onLoad }) => {
  const data: Data = useMemo(() => {
    return {
      type: "geojson",
      value: {
        type: "Feature",
        properties: {
          [STORY_MARKER_ID_PROPERTY]: id,
        },
        geometry: {
          coordinates: [capture.camera.lng, capture.camera.lat, capture.camera.height],
          type: "Point",
        },
      },
    };
  }, [id, capture]);

  useLayer({
    data,
    visible,
    appearances,
    onLoad,
  });

  return null;
};
