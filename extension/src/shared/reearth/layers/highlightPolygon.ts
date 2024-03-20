import unkinkPolygon from "@turf/unkink-polygon";
import { type Polygon, type MultiPolygon } from "geojson";
import { FC, useMemo } from "react";

import { useLayer } from "../hooks";
import { LayerAppearanceTypes } from "../types";
import { Data } from "../types/layer";

export type HighlightPolygonAppearances = Partial<Pick<LayerAppearanceTypes, "polygon">>;

export type HighlightPolygonProps = {
  geometry: Polygon | MultiPolygon;
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  appearances: HighlightPolygonAppearances;
};

export const HighlightPolygonLayer: FC<HighlightPolygonProps> = ({
  geometry,
  onLoad,
  visible,
  appearances,
}) => {
  const mergedAppearances: HighlightPolygonAppearances | undefined = useMemo(
    () => ({
      ...appearances,
      polygon: {
        classificationType: "terrain",
        heightReference: "clamp",
        ...(appearances.polygon ?? {}),
      },
    }),
    [appearances],
  );

  const data: Data = useMemo(
    () => ({
      type: "geojson",
      value: unkinkPolygon(geometry),
    }),
    [geometry],
  );

  useLayer({
    data,
    visible,
    appearances: mergedAppearances,
    onLoad,
  });

  return null;
};
