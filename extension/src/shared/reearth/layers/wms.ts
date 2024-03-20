import { FC, useMemo } from "react";

import { useLayer } from "../hooks";
import { LayerAppearanceTypes } from "../types";
import { Data } from "../types/layer";

export type WMSAppearances = Partial<Pick<LayerAppearanceTypes, "raster">>;

export type WMSProps = {
  url: string;
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  appearances?: WMSAppearances;
  layers?: string[];
};

const DEFAULT_APPEARNACES: Partial<LayerAppearanceTypes> = {
  raster: {
    alpha: 0.8,
    hideIndicator: true,
  },
};

export const WMSLayer: FC<WMSProps> = ({ url, onLoad, visible, appearances, layers }) => {
  const mergedAppearances: WMSAppearances | undefined = useMemo(
    () => ({
      ...(appearances ?? {}),
      raster: {
        ...DEFAULT_APPEARNACES.raster,
      },
    }),
    [appearances],
  );

  const data: Data = useMemo(
    () => ({
      type: "wms",
      url,
      layers,
      parameters: {
        transparent: "true",
        format: "image/png",
      },
    }),
    [url, layers],
  );

  useLayer({
    data,
    visible,
    appearances: mergedAppearances,
    onLoad,
  });

  return null;
};
