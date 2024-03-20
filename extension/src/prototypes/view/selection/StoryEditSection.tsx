import { Button, styled } from "@mui/material";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import { FC, useCallback, useState } from "react";

import { StoryCapture } from "../../../shared/layerContainers/story";
import { useCamera } from "../../../shared/reearth/hooks";
import { CaptureList } from "../../../shared/ui-components/story/CaptureList";
import { StoryCaptureEditor } from "../../../shared/view/ui-container/story/StoryCaptureEditor";
import { LayerModel } from "../../layers";
import { CameraIcon } from "../../ui-components";
import { STORY_LAYER } from "../../view-layers";

type StoryEditSectionProps = {
  layer: LayerModel<typeof STORY_LAYER>;
};

export const StoryEditSection: FC<StoryEditSectionProps> = ({ layer }) => {
  const [captures, setCaptures] = useAtom(layer.capturesAtom);
  const [editorOpen, setEditorOpen] = useState(false);
  const [newCapture, setNewCapture] = useState<StoryCapture | undefined>(undefined);

  const { getCameraPosition } = useCamera();

  const handleOpenNewCapture = useCallback(() => {
    const camera = getCameraPosition();
    if (!camera) return;
    setNewCapture({ id: nanoid(), camera });
    setEditorOpen(true);
  }, [getCameraPosition]);

  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false);
  }, []);

  const handleSaveCapture = useCallback(
    (capture: StoryCapture) => {
      const index = captures.findIndex(c => c.id === capture.id);
      if (index !== -1) {
        const newCaptures = [...captures];
        newCaptures[index] = capture;
        setCaptures(newCaptures);
      } else {
        setCaptures([...captures, capture]);
      }
      handleCloseEditor();
    },
    [captures, setCaptures, handleCloseEditor],
  );

  const handleRemoveCapture = useCallback(
    (id: string) => {
      setCaptures(captures.filter(c => c.id !== id));
    },
    [captures, setCaptures],
  );

  return (
    <SectionWrapper>
      <CaptureList
        captures={captures}
        onCaptureUpdate={handleSaveCapture}
        onCaptureRemove={handleRemoveCapture}
      />
      <ButtonWrapper>
        <Button
          size="small"
          variant="outlined"
          fullWidth
          startIcon={<CameraIcon />}
          onClick={handleOpenNewCapture}>
          新しいキャプチャ
        </Button>
      </ButtonWrapper>
      {editorOpen && (
        <StoryCaptureEditor
          open={editorOpen}
          capture={newCapture}
          onClose={handleCloseEditor}
          onSave={handleSaveCapture}
        />
      )}
    </SectionWrapper>
  );
};

const SectionWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(2, 0),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
}));
