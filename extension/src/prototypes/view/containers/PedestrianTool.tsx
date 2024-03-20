import { useAtomValue, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { useCallback, type FC } from "react";

import { LngLatHeight } from "../../../shared/reearth/types";
import { createRootLayerForLayerAtom } from "../../../shared/view-layers";
import { useAddLayer } from "../../layers";
import { PedestrianTool as PedestrianToolComponent } from "../../pedestrian";
import { PEDESTRIAN_LAYER } from "../../view-layers";
import { toolAtom, toolMachineAtom } from "../states/tool";

export const PedestrianTool: FC = () => {
  const send = useSetAtom(toolMachineAtom);
  const tool = useAtomValue(toolAtom);

  const addLayer = useAddLayer();
  const handleCreate = useCallback(
    (location: LngLatHeight) => {
      const id = nanoid();
      // TODO: Support share functionality
      // - It's ok that just keep the location
      const layer = createRootLayerForLayerAtom({
        id,
        type: PEDESTRIAN_LAYER,
        location: {
          longitude: location.lng,
          latitude: location.lat,
          height: location.height,
        },
      });
      addLayer(layer);
      send({ type: "HAND" });
    },
    [addLayer, send],
  );

  if (tool?.type !== "pedestrian") {
    return null;
  }
  return <PedestrianToolComponent onCreate={handleCreate} />;
};
