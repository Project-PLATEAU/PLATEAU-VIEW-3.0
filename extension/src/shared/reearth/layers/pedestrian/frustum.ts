import { FC, useMemo, useRef } from "react";

import { useLayer } from "../../hooks";
import { LayerAppearanceTypes } from "../../types";
import { Data } from "../../types/layer";

export type PedestrianFrustumAppearances = Partial<
  Pick<LayerAppearanceTypes, "frustum" | "transition">
>;

export type PedestrianFrustumProps = {
  coordinates: [lng: number, lat: number, height: number];
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  useTransition: boolean;
  appearances: PedestrianFrustumAppearances;
};

export const PedestrianFrustumLayer: FC<PedestrianFrustumProps> = ({
  coordinates,
  onLoad,
  visible,
  useTransition,
  appearances,
}) => {
  const mergedAppearances: PedestrianFrustumAppearances | undefined = useMemo(
    () => ({
      ...appearances,
      frustum: {
        ...(appearances.frustum ?? {}),
      },
      transition: {
        useTransition,
        translate: coordinates,
        ...(appearances.transition ?? {}),
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
        geometry: {
          coordinates: initialCoordinatesRef.current,
          type: "Point",
        },
      },
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
