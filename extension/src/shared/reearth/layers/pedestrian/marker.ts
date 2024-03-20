import { FC, useMemo, useRef } from "react";

import { useLayer } from "../../hooks";
import { LayerAppearanceTypes } from "../../types";
import { Data } from "../../types/layer";

export type PedestrianMarkerAppearances = Partial<
  Pick<LayerAppearanceTypes, "marker" | "transition">
>;

export type PedestrianMarkerProps = {
  id: string;
  coordinates: [lng: number, lat: number, height: number];
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  useTransition: boolean;
  appearances: PedestrianMarkerAppearances;
};

export const PEDESTRIAN_MARKER_ID_PROPERTY = "pedestrianID";

export const PedestrianMarkerLayer: FC<PedestrianMarkerProps> = ({
  id,
  coordinates,
  onLoad,
  visible,
  useTransition,
  appearances,
}) => {
  const mergedAppearances: PedestrianMarkerAppearances | undefined = useMemo(
    () => ({
      ...appearances,
      marker: {
        ...(appearances.marker ?? {}),
        hideIndicator: true,
      },
      transition: {
        useTransition,
        translate: coordinates,
      },
    }),
    [appearances, coordinates, useTransition],
  );

  const initialCoordinatesRef = useRef(coordinates);
  const data: Data = useMemo(
    () => ({
      type: "geojson",
      value: {
        type: "Feature",
        properties: {
          [PEDESTRIAN_MARKER_ID_PROPERTY]: id,
        },
        geometry: {
          coordinates: initialCoordinatesRef.current,
          type: "Point",
        },
      },
    }),
    [id],
  );

  useLayer({
    data,
    visible,
    appearances: mergedAppearances,
    onLoad,
  });

  return null;
};
