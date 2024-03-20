import { CameraPosition } from "../types";

export const flyToLayerId = (layerId: string) =>
  window.reearth?.camera?.flyTo(layerId, { duration: 0.5 });

export const flyToCamera = (camera: CameraPosition) =>
  window.reearth?.camera?.flyTo(camera, { duration: 0.5 });
