import { FC, useMemo } from "react";

import { useLayer } from "../hooks";
import { LayerAppearanceTypes } from "../types";
import { Data } from "../types/layer";

export type GTFSAppearances = Partial<Pick<LayerAppearanceTypes, "model" | "marker">>;

export type GTFSProps = {
  url: string;
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  appearances: GTFSAppearances;
  updateInterval?: number;
};

const DEFAULT_APPEARNACES: GTFSAppearances = {
  marker: {
    near: 1000,
    heightReference: "clamp",
  },
  model: {
    heightReference: "clamp",
  },
};

export const GTFSLayer: FC<GTFSProps> = ({ url, onLoad, visible, appearances, updateInterval }) => {
  const mergedAppearances: GTFSAppearances | undefined = useMemo(
    () => ({
      ...appearances,
      marker: {
        ...DEFAULT_APPEARNACES.marker,
        ...(appearances.marker ?? {}),
      },
      model: {
        ...DEFAULT_APPEARNACES.model,
        ...(appearances.model ?? {}),
      },
    }),
    [appearances],
  );

  const data: Data = useMemo(
    () => ({
      type: "gtfs",
      url,
      updateInterval,
    }),
    [url, updateInterval],
  );

  useLayer({
    data,
    visible,
    appearances: mergedAppearances,
    onLoad,
  });

  return null;
};
