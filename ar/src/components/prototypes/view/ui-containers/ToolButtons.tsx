import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, type FC } from "react";

import {
  AppToggleButton,
  AppToggleButtonGroup,
  HandIcon,
  PedestrianIcon,
  PointerArrowIcon,
  SketchIcon,
  StoryIcon,
} from "../../ui-components";
import { toolAtom, toolMachineAtom, type ToolType } from "../states/tool";
import { type EventObject } from "../states/toolMachine";

const eventTypes: Record<ToolType, EventObject["type"]> = {
  hand: "HAND",
  select: "SELECT",
  sketch: "SKETCH",
  story: "STORY",
  pedestrian: "PEDESTRIAN",
};

export const ToolButtons: FC = () => {
  const send = useSetAtom(toolMachineAtom);
  const tool = useAtomValue(toolAtom);

  const handleChange = useCallback(
    (_event: unknown, value: ToolType | null) => {
      if (value != null) {
        send({ type: eventTypes[value] });
      }
    },
    [send],
  );

  return (
    <AppToggleButtonGroup value={tool?.type} onChange={handleChange}>
      <AppToggleButton value="hand" title="移動" shortcutKey="H">
        <HandIcon fontSize="medium" />
      </AppToggleButton>
      <AppToggleButton value="select" title="選択" shortcutKey="V">
        <PointerArrowIcon fontSize="medium" />
      </AppToggleButton>
      <AppToggleButton value="pedestrian" title="歩行者視点" shortcutKey="P" disabled>
        <PedestrianIcon fontSize="medium" />
      </AppToggleButton>
      <AppToggleButton value="sketch" title="作図" shortcutKey="G" disabled>
        <SketchIcon fontSize="medium" />
      </AppToggleButton>
      <AppToggleButton value="story" title="ストーリー" shortcutKey="T" disabled>
        <StoryIcon fontSize="medium" />
      </AppToggleButton>
    </AppToggleButtonGroup>
  );
};
