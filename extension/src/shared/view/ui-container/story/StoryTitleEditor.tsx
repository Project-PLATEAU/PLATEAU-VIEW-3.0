import { useAtom, useSetAtom } from "jotai";
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from "react";

import { LayerModel } from "../../../../prototypes/layers";
import { StoryIcon } from "../../../../prototypes/ui-components";
import { preventToolKeyDownAtom } from "../../../../prototypes/view/states/tool";
import { STORY_LAYER } from "../../../../prototypes/view-layers";
import {
  ViewDialog,
  ViewTextField,
  ViewLabel,
  ViewContentColumn,
} from "../../../ui-components/common";

type StoryTitleEditorProps = {
  open: boolean;
  layer: LayerModel<typeof STORY_LAYER>;
  onClose: () => void;
};

export const StoryTitleEditor: FC<StoryTitleEditorProps> = ({ open, layer, onClose }) => {
  const [layerTitle, setLayerTitle] = useAtom(layer.titleAtom);
  const [storyName, setStoryName] = useState(
    (typeof layerTitle === "object" ? layerTitle?.primary : layerTitle) ?? "",
  );
  const disableSubmit = useMemo(() => !storyName.trim(), [storyName]);

  const handleClose = useCallback(() => {
    onClose();
    setStoryName("");
  }, [onClose]);

  const handleStoryNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setStoryName(event.target.value);
    },
    [],
  );

  const handleSave = useCallback(() => {
    setLayerTitle(storyName);
    layer.title = storyName;
    onClose();
  }, [layer, storyName, setLayerTitle, onClose]);

  const preventToolKeyDown = useSetAtom(preventToolKeyDownAtom);
  useEffect(() => {
    preventToolKeyDown(open);
  }, [open, preventToolKeyDown]);

  return (
    <ViewDialog
      icon={<StoryIcon />}
      title="ストーリーのタイトルを編集"
      open={open}
      disableSubmit={disableSubmit}
      onClose={handleClose}
      onSubmit={handleSave}>
      <ViewContentColumn>
        <ViewLabel>ストーリー名</ViewLabel>
        <ViewTextField value={storyName} onChange={handleStoryNameChange} />
      </ViewContentColumn>
    </ViewDialog>
  );
};
