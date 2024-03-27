import { useMediaQuery, useTheme } from "@mui/material";
import { useAtomValue } from "jotai";
import { type FC } from "react";

import { STORY_MARKER_ID_PROPERTY } from "../../../shared/reearth/layers";
import { PickedFeature } from "../../../shared/reearth/types";
import {
  ScreenSpaceSelection as PlateauScreenSpaceSelection,
  type ScreenSpaceSelectionProps as PlateauScreenSpaceSelectionProps,
} from "../../screen-space-selection";
import { toolAtom } from "../states/tool";

const EVENTS_ON_SELECT_TOOL = {
  point: true,
  rectangle: true,
  select: true,
};

const EVENTS_ON_STORY_TOOL = {
  point: true,
  rectangle: false,
  select: false,
};

export type ScreenSpaceSelectionProps = Omit<PlateauScreenSpaceSelectionProps, "disabled">;

const isFeatureStoryCapture = (f: PickedFeature | undefined) =>
  f?.properties && !!f.properties[STORY_MARKER_ID_PROPERTY];

export const ScreenSpaceSelection: FC<ScreenSpaceSelectionProps> = props => {
  const tool = useAtomValue(toolAtom);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));
  return (
    <PlateauScreenSpaceSelection
      {...props}
      disabled={tool?.type !== "select" && tool?.type !== "story"}
      allowClickWhenDisabled={isMobile}
      filterSelectedFeature={tool?.type === "story" ? isFeatureStoryCapture : undefined}
      allowedEvents={
        isMobile || tool?.type === "select" ? EVENTS_ON_SELECT_TOOL : EVENTS_ON_STORY_TOOL
      }
    />
  );
};
