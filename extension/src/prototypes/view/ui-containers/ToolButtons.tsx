import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, type FC, useMemo } from "react";

import { showCreateStoryAtom } from "../../../shared/view/state/story";
import { isSketchGeometryType } from "../../sketch";
import {
  AppToggleButton,
  AppToggleButtonGroup,
  AppToggleButtonSelect,
  HandIcon,
  PedestrianIcon,
  PointerArrowIcon,
  StoryIcon,
  SketchRectangleIcon,
  SketchCircleIcon,
  SketchPolygonIcon,
} from "../../ui-components";
import { AppToggleButtonMenu } from "../../ui-components/AppToggleButtonMenu";
import { sketchTypeAtom, toolAtom, toolMachineAtom, type ToolType } from "../states/tool";
import { type EventObject } from "../states/toolMachine";

const eventTypes: Record<ToolType, EventObject["type"]> = {
  hand: "HAND",
  select: "SELECT",
  sketch: "SKETCH",
  story: "STORY",
  pedestrian: "PEDESTRIAN",
};

const sketchItems = [
  { value: "rectangle", title: "立方体", icon: <SketchRectangleIcon /> },
  { value: "circle", title: "円柱", icon: <SketchCircleIcon /> },
  { value: "polygon", title: "自由形状", icon: <SketchPolygonIcon /> },
];

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

  const [sketchType, setSketchType] = useAtom(sketchTypeAtom);
  const handleSketchTypeChange = useCallback(
    (_: unknown, value: string) => {
      if (isSketchGeometryType(value)) {
        send({ type: "SKETCH" });
        setSketchType(value);
      }
    },
    [send, setSketchType],
  );

  const showCreateStory = useSetAtom(showCreateStoryAtom);
  const handleCreateStory = useCallback(() => {
    showCreateStory(true);
  }, [showCreateStory]);

  const storyItems = useMemo(
    () => [{ title: "新しいストーリー", icon: <StoryIcon />, onClick: handleCreateStory }],
    [handleCreateStory],
  );

  return (
    <AppToggleButtonGroup value={tool?.type} onChange={handleChange}>
      <AppToggleButton value="hand" title="移動" shortcutKey="H">
        <HandIcon fontSize="medium" />
      </AppToggleButton>
      <AppToggleButton value="select" title="選択" shortcutKey="V">
        <PointerArrowIcon fontSize="medium" />
      </AppToggleButton>
      <AppToggleButton value="pedestrian" title="歩行者視点" shortcutKey="P">
        <PedestrianIcon fontSize="medium" />
      </AppToggleButton>
      <AppToggleButtonSelect
        value="sketch"
        title="作図"
        shortcutKey="G"
        items={sketchItems}
        selectedValue={sketchType}
        onValueChange={handleSketchTypeChange}
      />
      <AppToggleButtonMenu value="story" title="ストーリー" shortcutKey="T" items={storyItems}>
        <StoryIcon fontSize="medium" />
      </AppToggleButtonMenu>
    </AppToggleButtonGroup>
  );
};
