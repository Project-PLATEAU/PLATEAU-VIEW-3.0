import { Divider, List } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useMemo } from "react";
import invariant from "tiny-invariant";

import { LayerModel, layerSelectionAtom } from "../../layers";
import { InspectorHeader } from "../../ui-components";
import { STORY_LAYER, layerTypeIcons } from "../../view-layers";
import { LAYER_SELECTION, SelectionGroup } from "../states/selection";
import { toolAtom } from "../states/tool";

import { StoryEditSection } from "./StoryEditSection";
import { StoryInspectSection } from "./StoryInspectSection";

export interface StoryLayerContentProps {
  values: (SelectionGroup & {
    type: typeof LAYER_SELECTION;
    subtype: typeof STORY_LAYER;
  })["values"];
}

export const StoryLayerContent: FC<StoryLayerContentProps> = ({ values }) => {
  invariant(values.length === 1);

  const layer = values[0] as LayerModel<typeof STORY_LAYER>;

  const tool = useAtomValue(toolAtom);
  const editMode = useMemo(() => tool?.type === "story", [tool]);

  const setSelection = useSetAtom(layerSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  return (
    <List disablePadding>
      <InspectorHeader
        title={editMode ? "ストーリーエディタ" : "ストーリー"}
        iconComponent={layerTypeIcons.STORY_LAYER}
        onClose={handleClose}
      />
      <Divider />
      {editMode ? <StoryEditSection layer={layer} /> : <StoryInspectSection layer={layer} />}
    </List>
  );
};
