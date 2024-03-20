// import { Cartesian2, PerspectiveFrustum, type Camera } from "@cesium/engine";
// import invariant from "tiny-invariant";

import { CameraPosition } from "../../shared/reearth/types";

export function getFieldOfView(camera: CameraPosition, zoom: number): number {
  const fov = getFieldOfViewSeparate(camera, zoom);
  const aspectRatio = camera.aspectRatio ?? 1;
  return aspectRatio > 1 ? fov.x : fov.y;
}

export function getFieldOfViewSeparate(
  camera: CameraPosition,
  zoom: number,
): { x: number; y: number } {
  const x = Math.atan(Math.pow(2, 1 - zoom)) * 2;
  return {
    x,
    y: 2 * Math.atan((camera.aspectRatio ?? 1) * Math.tan(x / 2)),
  };
}
