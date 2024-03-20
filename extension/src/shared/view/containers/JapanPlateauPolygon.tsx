import { FC, useEffect, useState } from "react";

import { useCamera } from "../../reearth/hooks";
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
    fillColor: {
      expression: "color('#00BEBE',0.2)",
    },
    heightReference: "clamp",
    hideIndicator: true,
    selectedFeatureColor: {
      expression: "color('#00BEBE',0.4)",
    },
  },
};
const JapanPlateauPolygon: FC = () => {
  const { getCameraPosition } = useCamera();
  const camera = getCameraPosition();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (camera?.height && camera.height >= CAMERA_ZOOM_LEVEL_HEIGHT) {
      setVisible(true);
    } else return setVisible(false);
  }, [camera?.height]);

  return <PolygonLayer visible={visible} appearances={appererances} />;
};

export default JapanPlateauPolygon;
