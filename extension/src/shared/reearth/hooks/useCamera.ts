import { useCallback } from "react";

import { CameraOptions, CameraPosition, LngLatHeight } from "../types";

export interface CameraZoom {
  zoomIn: () => void;
  zoomOut: () => void;
}

export function useCameraZoom(): CameraZoom {
  const camera = window.reearth?.camera;

  const zoomOut = useCallback(() => {
    camera?.zoomOut(1.5);
  }, [camera]);

  const zoomIn = useCallback(() => {
    camera?.zoomIn(1.5);
  }, [camera]);

  return { zoomIn, zoomOut };
}

export function useCamera(): {
  flyTo: (camera: CameraPosition) => void;
  getCameraPosition: () => CameraPosition | undefined;
  getCameraFovInfo: (options?: { withTerrain?: boolean; calcViewSize?: boolean }) =>
    | {
        center?: LngLatHeight;
        viewSize?: number;
      }
    | undefined;
} {
  const getCameraPosition = useCallback(() => {
    return window.reearth?.camera?.position;
  }, []);

  const flyTo = useCallback((camera: CameraPosition, options?: CameraOptions) => {
    window.reearth?.camera?.flyTo(camera, options ?? { duration: 2 });
  }, []);

  const getCameraFovInfo = useCallback(
    (
      options:
        | {
            withTerrain?: boolean;
            calcViewSize?: boolean;
          }
        | undefined,
    ) => {
      return window.reearth?.camera?.getFovInfo({
        withTerrain: options?.withTerrain ?? true,
        calcViewSize: options?.calcViewSize ?? false,
      });
    },
    [],
  );

  return {
    flyTo,
    getCameraPosition,
    getCameraFovInfo,
  };
}
