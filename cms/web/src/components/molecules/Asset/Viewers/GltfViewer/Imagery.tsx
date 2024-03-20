import { Cartesian3 } from "cesium";
import { useCallback, useEffect } from "react";
import { useCesium } from "resium";

type Props = {
  url: string;
};

export const Imagery: React.FC<Props> = ({ url }) => {
  const { viewer } = useCesium();

  const loadModel = useCallback(async () => {
    if (!viewer) return;
    viewer.entities.removeAll();
    const entity = viewer.entities.add({
      position: Cartesian3.fromDegrees(
        Math.floor(Math.random() * 360 - 180),
        Math.floor(Math.random() * 180 - 90),
        0,
      ),
      model: {
        uri: url,
        minimumPixelSize: 128,
        maximumScale: 20000,
      },
    });
    viewer.trackedEntity = entity;
  }, [url, viewer]);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  return null;
};
