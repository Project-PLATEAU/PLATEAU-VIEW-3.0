import { FC, useCallback, useState } from "react";

import { useCamera, useReEarthEvent } from "../../reearth/hooks";
import { PolygonAppearances, PolygonLayer } from "../../reearth/layers";

const CAMERA_ZOOM_LEVEL_HEIGHT = 300000;
const appererances: PolygonAppearances = {
  resource: {
    fill: "rgba(0,190,190, 0.2)",
    stroke: "rgba(0, 190, 190, 1)",
    strokeWidth: 1,
    hideIndicator: true,
    clampToGround: true,
  },
  polygon: {
    classificationType: "terrain",
    fill: true,
    fillColor: "rgba(0, 190, 190, 0.2)",
    heightReference: "clamp",
    hideIndicator: true,
    selectedFeatureColor: "rgba(0, 190, 190, 0.4)",
  },
};
const JapanPlateauPolygon: FC = () => {
  const { getCameraPosition } = useCamera();
  const [visible, setVisible] = useState(false);

  const updateVisibility = useCallback(() => {
    const camera = getCameraPosition();
    if (camera?.height && camera.height >= CAMERA_ZOOM_LEVEL_HEIGHT) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [getCameraPosition]);

  useReEarthEvent("cameramove", updateVisibility);

  if (!visible) return null;

  return <PolygonLayer appearances={appererances} />;
};

export default JapanPlateauPolygon;
