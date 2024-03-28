import { useMediaQuery, useTheme } from "@mui/material";
import { nanoid } from "nanoid";
import { useCallback, type FC } from "react";

import { createRootLayerForLayerAtom } from "../../../shared/view-layers";
import { useAddLayer } from "../../layers";
import { AppIconButton, StoryIcon } from "../../ui-components";
import { STORY_LAYER } from "../../view-layers";

export const StoryButton: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));

  const addLayer = useAddLayer();
  const handleCreateStory = useCallback(() => {
    const id = nanoid();
    addLayer(
      createRootLayerForLayerAtom({
        id,
        type: STORY_LAYER,
        title: "新しいストーリー",
        captures: [],
      }),
      { autoSelect: true },
    );
  }, [addLayer]);

  return !isMobile ? (
    <AppIconButton title="ストーリー" onClick={handleCreateStory}>
      <StoryIcon />
    </AppIconButton>
  ) : null;
};
