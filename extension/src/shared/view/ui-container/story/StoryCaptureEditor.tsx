import { useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";

import { CameraIcon } from "../../../../prototypes/ui-components";
import { preventToolKeyDownAtom } from "../../../../prototypes/view/states/tool";
import { StoryCapture } from "../../../layerContainers/story";
import {
  ViewContentColumn,
  ViewDialog,
  ViewMarkdownEditor,
  ViewTextField,
} from "../../../ui-components/common";

type StoryCaptureEditorProps = {
  open: boolean;
  capture: StoryCapture | undefined;
  onClose: () => void;
  onSave: (capture: StoryCapture) => void;
};

export const StoryCaptureEditor: React.FC<StoryCaptureEditorProps> = ({
  open,
  capture,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(capture?.title ?? "");
  const [content, setContent] = useState(capture?.content ?? "");

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!capture) return;
    onSave({
      ...capture,
      title,
      content,
    });
  }, [capture, title, content, onSave]);

  const preventToolKeyDown = useSetAtom(preventToolKeyDownAtom);
  useEffect(() => {
    preventToolKeyDown(open);
  }, [open, preventToolKeyDown]);

  return (
    <ViewDialog
      open={open}
      title="キャプチャエディタ"
      icon={<CameraIcon />}
      disableSubmit={!title.trim() || !content.trim()}
      onClose={onClose}
      onSubmit={handleSubmit}>
      <ViewContentColumn>
        <ViewTextField placeholder="タイトル" value={title} onChange={handleTitleChange} />
        <ViewMarkdownEditor value={content} onChange={handleContentChange} />
      </ViewContentColumn>
    </ViewDialog>
  );
};
