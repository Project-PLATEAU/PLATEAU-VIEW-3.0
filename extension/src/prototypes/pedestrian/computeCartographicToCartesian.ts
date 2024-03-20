import { XYZ } from "../../shared/reearth/types";

import { type Location } from "./types";

export function computeCartographicToCartesian(location: Location): XYZ {
  const height = window.reearth?.scene?.computeGlobeHeight(
    location.longitude,
    location.latitude,
    location.height,
  );
  const [x, y, z] = window.reearth?.scene?.toXYZ(
    location.longitude,
    location.latitude,
    (height ?? 0) + (location.height ?? 0),
    { useGlobeEllipsoid: true },
  ) ?? [0, 0, 0];
  return {
    x,
    y,
    z,
  };
}
