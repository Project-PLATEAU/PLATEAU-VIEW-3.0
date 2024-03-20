import { FC, useMemo } from "react";

import { PLATEAU_GEOJSON_URL } from "../../constants";
import { useLayer } from "../hooks";
import { Data, LayerAppearanceTypes } from "../types";

export type PolygonAppearances = Partial<Pick<LayerAppearanceTypes, "polygon" | "resource">>;

export type PolygonProps = {
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  appearances?: PolygonAppearances;
};

export const PolygonLayer: FC<PolygonProps> = ({ onLoad, visible, appearances }) => {
  const mergedAppearances: PolygonAppearances | undefined = useMemo(
    () => ({
      ...appearances,
      polygon: {
        ...(appearances?.polygon ?? {}),
      },
    }),
    [appearances],
  );

  const data: Data = useMemo(
    () => ({
      type: "geojson",
      url: PLATEAU_GEOJSON_URL,
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
