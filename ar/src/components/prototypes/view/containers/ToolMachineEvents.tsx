import { useAtom } from "jotai";
import { useEffect, type FC } from "react";

import { useReEarthEvent } from "../../../shared/reearth/hooks";
import { getCesiumCanvas } from "../../../shared/reearth/utils";
import { useWindowEvent } from "../../react-helpers";
import { getTool, toolMachineAtom } from "../states/tool";

export const ToolMachineEvents: FC = () => {
  const [state, send] = useAtom(toolMachineAtom);
  // const tool = useAtomValue(toolAtom);

  // TODO(ReEarth): Support this API from ReEarth side.
  // Stop inertial movements when switching between tools. There're no such
  // public methods to do so, so I'm accessing private API.
  // useEffect(() => {
  //   // Private API
  //   const controller = scene.screenSpaceCameraController as ScreenSpaceCameraController & {
  //     _aggregator: CameraEventAggregator & {
  //       _lastMovement: Record<
  //         string,
  //         {
  //           startPosition: Cartesian2;
  //           endPosition: Cartesian2;
  //         }
  //       >;
  //     };
  //   };
  //   Object.values(controller._aggregator._lastMovement).forEach(
  //     ({ startPosition, endPosition }) => {
  //       startPosition.x = 0;
  //       startPosition.y = 0;
  //       endPosition.x = 0;
  //       endPosition.y = 0;
  //     },
  //   );
  // }, [tool, scene]);

  useWindowEvent("keydown", event => {
    if (event.repeat) {
      return;
    }
    if (
      event.code === "Space" &&
      !event.altKey &&
      !event.shiftKey &&
      !event.metaKey &&
      !event.ctrlKey
    ) {
      send({ type: "PRESS_SPACE" });
    } else if (event.key === "Meta") {
      send({ type: "PRESS_COMMAND" });
    }
  });
  useWindowEvent("keyup", event => {
    if (event.code === "Space") {
      send({ type: "RELEASE_SPACE" });
    } else if (event.key === "Meta") {
      send({ type: "RELEASE_COMMAND" });
    }
  });
  useWindowEvent("blur", () => {
    send({ type: "WINDOW_BLUR" });
  });
  useWindowEvent("focus", () => {
    send({ type: "WINDOW_FOCUS" });
  });

  useReEarthEvent("mousedown", () => {
    send({ type: "MOUSE_DOWN" });
  });
  useReEarthEvent("mouseup", () => {
    send({ type: "MOUSE_UP" });
  });

  const canvas = getCesiumCanvas();
  useEffect(() => {
    let cursor;
    const tool = getTool(state);
    if (tool?.type === "hand" && tool.active) {
      cursor = "grabbing";
    } else if (tool?.type === "hand" && !tool.active) {
      cursor = "grab";
      // } else if (tool?.type === "sketch") {
      // cursor = `url("${crossCursor.src}") 12 12, auto`;
    } else {
      cursor = "auto";
    }

    if (canvas) {
      canvas.style.cursor = cursor;
    }
  }, [canvas, state]);

  return null;
};
