import { useAtomValue, useSetAtom } from "jotai";
import { type FC } from "react";

import { streetViewAtom, streetViewVisibleAtom } from "../../pedestrian";
import { useWindowEvent } from "../../react-helpers";
import { platformAtom } from "../../shared-states";
import { testShortcut } from "../../ui-components";
import { hideAppOverlayAtom, showDeveloperPanelsAtom } from "../states/app";
import { toolMachineAtom } from "../states/tool";

export const KeyBindings: FC = () => {
  const platform = useAtomValue(platformAtom);
  const setHideAppOverlay = useSetAtom(hideAppOverlayAtom);
  const setShowDeveloperPanels = useSetAtom(showDeveloperPanelsAtom);
  const send = useSetAtom(toolMachineAtom);

  const streetViewVisible = useAtomValue(streetViewVisibleAtom);
  const streetView = useAtomValue(streetViewAtom);

  useWindowEvent("keydown", event => {
    if (
      testShortcut(event, platform, {
        code: "Slash",
        commandKey: true,
      })
    ) {
      event.preventDefault();
      setHideAppOverlay(value => !value);
      return;
    }
    if (
      testShortcut(event, platform, {
        code: "Backslash",
        commandKey: true,
      })
    ) {
      event.preventDefault();
      setShowDeveloperPanels(value => !value);
      return;
    }

    if (document.activeElement !== document.body) {
      return;
    }

    if (event.altKey || event.metaKey || event.ctrlKey) {
      return;
    }
    if (event.shiftKey) {
      return;
    }
    if (!event.repeat) {
      switch (event.key) {
        case "v":
          event.preventDefault();
          send({ type: "SELECT" });
          return;
        case "h":
          event.preventDefault();
          send({ type: "HAND" });
          return;
        case "g":
          event.preventDefault();
          send({ type: "SKETCH" });
          return;
        case "t":
          event.preventDefault();
          send({ type: "STORY" });
          return;
        case "p":
          event.preventDefault();
          send({ type: "PEDESTRIAN" });
          return;
      }
    }
    if (
      streetViewVisible &&
      streetView != null &&
      (event.key === "w" ||
        event.key === "a" ||
        event.key === "s" ||
        event.key === "d" ||
        event.code === "ArrowUp" ||
        event.code === "ArrowDown" ||
        event.code === "ArrowLeft" ||
        event.code === "ArrowRight")
    ) {
      event.preventDefault();
      // TODO: This misses the first key input.
      streetView.panorama.focus();
    }
  });

  return null;
};
