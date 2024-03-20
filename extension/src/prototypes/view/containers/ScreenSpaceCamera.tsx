import { useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";

import { ScreenSpaceCameraControllerOptions } from "../../../shared/reearth/types";
import { enableKeyboardCameraControlAtom } from "../states/app";

import { KeyboardHandlers } from "./KeyboardHandlers";

type ScreenSpaceCameraProps = {
  tiltByRightButton: boolean;
  minimumZoomDistance?: number;
  maximumZoomDistance?: number;
};
export const ScreenSpaceCamera = ({
  tiltByRightButton = false,
  minimumZoomDistance = 1.5,
  maximumZoomDistance = Infinity,
}: ScreenSpaceCameraProps) => {
  const useKeyboard = useAtomValue(enableKeyboardCameraControlAtom);

  const optionsWhenUseKeyboard: ScreenSpaceCameraControllerOptions = useMemo(
    () => ({
      zoomEventTypes: [],
      rotateEventTypes: [],
      tiltEventTypes: [],
      lookEventTypes: [
        "left_drag",
        {
          eventType: "left_drag",
          modifier: "ctrl",
        },
        {
          eventType: "left_drag",
          modifier: "shift",
        },
      ],
      maximumZoomDistance,
      minimumZoomDistance,
      enableCollisionDetection: !useKeyboard,
    }),
    [minimumZoomDistance, maximumZoomDistance, useKeyboard],
  );

  const optionsWhenTiltByRightButton: ScreenSpaceCameraControllerOptions = useMemo(
    () => ({
      zoomEventTypes: ["middle_drag", "wheel", "pinch"],
      rotateEventTypes: ["left_drag"],
      tiltEventTypes: [
        "right_drag",
        "pinch",
        {
          eventType: "left_drag",
          modifier: "ctrl",
        },
        {
          eventType: "right_drag",
          modifier: "ctrl",
        },
      ],
      maximumZoomDistance,
      minimumZoomDistance,
      enableCollisionDetection: !useKeyboard,
    }),
    [minimumZoomDistance, maximumZoomDistance, useKeyboard],
  );

  useEffect(() => {
    if (useKeyboard) {
      window?.reearth?.camera?.overrideScreenSpaceController(optionsWhenUseKeyboard);
    } else if (tiltByRightButton) {
      window?.reearth?.camera?.overrideScreenSpaceController(optionsWhenTiltByRightButton);
    } else {
      window?.reearth?.camera?.overrideScreenSpaceController();
    }
  }, [useKeyboard, tiltByRightButton, optionsWhenUseKeyboard, optionsWhenTiltByRightButton]);

  useEffect(() => {
    window?.reearth?.camera?.forceHorizontalRoll(true);
  }, []);

  return useKeyboard ? <KeyboardHandlers isMoving={useKeyboard} /> : null;
};
