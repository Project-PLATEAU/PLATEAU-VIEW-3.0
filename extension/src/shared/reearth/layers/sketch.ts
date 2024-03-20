import { FC, useMemo } from "react";

import { useLayer } from "../hooks";
import { Data, LayerAppearanceTypes, SketchFeature } from "../types";

export type SketchProps = {
  features: SketchFeature[];
  appearances: Partial<LayerAppearanceTypes>;
  visible?: boolean;
  onLoad?: (layerId: string) => void;
};

export const SketchLayer: FC<SketchProps> = ({ features, appearances, visible, onLoad }) => {
  const data: Data = useMemo(
    () => ({
      type: "geojson",
      isSketchLayer: true,
      value: {
        type: "FeatureCollection",
        features: features.map(f => ({ ...f, id: f.properties.id })),
      },
    }),
    [features],
  );

  useLayer({
    data,
    visible,
    appearances,
    onLoad,
  });
  return null;
};
