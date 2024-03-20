import { FC, useMemo } from "react";

import { useLayer } from "../hooks";
import { LayerAppearanceTypes } from "../types";
import { Data } from "../types/layer";

export type HeatmapAppearances = Partial<Pick<LayerAppearanceTypes, "heatMap">>;

export type HeatmapProps = {
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  appearances: HeatmapAppearances;
};

export const HeatmapLayer: FC<HeatmapProps> = ({ onLoad, visible, appearances }) => {
  const mergedAppearances: HeatmapAppearances | undefined = useMemo(
    () => ({
      ...appearances,
      heatMap: {
        ...(appearances.heatMap ?? {}),
      },
    }),
    [appearances],
  );

  const data: Data = useMemo(
    () => ({
      type: "heatMap",
    }),
    [],
  );

  useLayer({
    data,
    visible,
    appearances: mergedAppearances,
    onLoad,
  });

  return null;
};
