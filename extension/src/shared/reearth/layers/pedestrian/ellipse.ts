import { FC, useMemo, useRef } from "react";

import { useLayer } from "../../hooks";
import { LayerAppearanceTypes } from "../../types";
import { Data } from "../../types/layer";

export type PedestrianEllipseAppearances = Partial<
  Pick<LayerAppearanceTypes, "ellipse" | "transition">
>;

export type PedestrianEllipseProps = {
  coordinates: [lng: number, lat: number, height: number];
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  useTransition: boolean;
  appearances: PedestrianEllipseAppearances;
};

export const PedestrianEllipseLayer: FC<PedestrianEllipseProps> = ({
  coordinates,
  onLoad,
  visible,
  useTransition,
  appearances,
}) => {
  const mergedAppearances: PedestrianEllipseAppearances | undefined = useMemo(
    () => ({
      ...appearances,
      ellipse: {
        ...(appearances.ellipse ?? {}),
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
