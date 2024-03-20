import { useAtom, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from "react";

import { useAddLayer } from "../../../../prototypes/layers";
import { StoryIcon } from "../../../../prototypes/ui-components";
import { preventToolKeyDownAtom, toolMachineAtom } from "../../../../prototypes/view/states/tool";
import { STORY_LAYER } from "../../../../prototypes/view-layers";
import {
  ViewDialog,
  ViewTextField,
  ViewLabel,
  ViewContentColumn,
} from "../../../ui-components/common";
import { createRootLayerForLayerAtom } from "../../../view-layers";
import { showCreateStoryAtom } from "../../state/story";

export const StoryCreator: FC = () => {
  const [showCreateStory, setShowCreateStory] = useAtom(showCreateStoryAtom);
  const send = useSetAtom(toolMachineAtom);

  const handleClose = useCallback(() => {
    setShowCreateStory(false);
    setStoryName("");
  }, [setShowCreateStory]);

  const [storyName, setStoryName] = useState("");
  const handleStoryNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setStoryName(event.target.value);
    },
    [],
  );
  const disableSubmit = useMemo(() => !storyName.trim(), [storyName]);

  const addLayer = useAddLayer();
  const handleCreate = useCallback(() => {
    const id = nanoid();
    addLayer(
      createRootLayerForLayerAtom({
        id,
        type: STORY_LAYER,
        title: storyName,
        captures: [],
      }),
      { autoSelect: true },
    );
    send({ type: "STORY" });
    handleClose();
  }, [storyName, addLayer, handleClose, send]);

  const preventToolKeyDown = useSetAtom(preventToolKeyDownAtom);
  useEffect(() => {
    preventToolKeyDown(showCreateStory);
  }, [showCreateStory, preventToolKeyDown]);

  return (
    <ViewDialog
      icon={<StoryIcon />}
      title="新しいストーリーを作成"
      open={showCreateStory}
      disableSubmit={disableSubmit}
      onClose={handleClose}
      onSubmit={handleCreate}>
      <ViewContentColumn>
        <ViewLabel>ストーリー名</ViewLabel>
        <ViewTextField value={storyName} onChange={handleStoryNameChange} />
      </ViewContentColumn>
    </ViewDialog>
  );
};
