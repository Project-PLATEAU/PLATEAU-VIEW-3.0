import { Button, Divider, IconButton, List, Tooltip, styled } from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useMemo, useState } from "react";
import invariant from "tiny-invariant";

import { STORY_OBJECT, StoryCapture } from "../../../shared/layerContainers/story";
import { useCamera } from "../../../shared/reearth/hooks";
import { ViewMarkdownViewer } from "../../../shared/ui-components/common";
import { StoryCaptureEditor } from "../../../shared/view/ui-container/story/StoryCaptureEditor";
import { matchIdentifier } from "../../cesium-helpers";
import { layerSelectionAtom } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import { AddressIcon, InspectorHeader, LayerIcon, TrashIcon } from "../../ui-components";
import { STORY_LAYER, highlightedStoryLayersAtom, layerTypeIcons } from "../../view-layers";
import { SCREEN_SPACE_SELECTION, SelectionGroup } from "../states/selection";
import { toolAtom } from "../states/tool";

export interface StoryCaptureContentProps {
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof STORY_OBJECT;
  })["values"];
}

export const StoryCaptureContent: FC<StoryCaptureContentProps> = ({ values }) => {
  const storyLayers = useAtomValue(highlightedStoryLayersAtom);
  invariant(values.length === 1 && storyLayers.length === 1);

  const [captures, setCaptures] = useAtom(storyLayers[0].capturesAtom);

  const capture = useMemo(
    () =>
      captures?.find(capture =>
        matchIdentifier(values[0], {
          type: "Story",
          key: capture.id,
        }),
      ),
    [captures, values],
  );

  const tool = useAtomValue(toolAtom);
  const editMode = useMemo(() => tool?.type === "story", [tool]);

  const setSelection = useSetAtom(screenSpaceSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const setLayerSelection = useSetAtom(layerSelectionAtom);
  const handleSelectLayers = useCallback(() => {
    setLayerSelection(storyLayers.map(layer => ({ id: layer.id, type: STORY_LAYER })));
  }, [storyLayers, setLayerSelection]);

  const handleRemove = useCallback(() => {
    if (!capture) return;
    handleSelectLayers();
    setCaptures(captures.filter(c => c.id !== capture.id));
    handleSelectLayers();
  }, [capture, captures, setCaptures, handleSelectLayers]);

  const { flyTo, getCameraPosition } = useCamera();
  const handleMove = useCallback(() => {
    if (!capture) return;
    flyTo(capture.camera);
  }, [capture, flyTo]);

  const handleRecapture = useCallback(() => {
    if (!capture) return;
    const camera = getCameraPosition();
    if (!camera) return;
    setCaptures(captures.map(c => (c.id === capture.id ? { ...c, camera } : c)));
  }, [capture, captures, setCaptures, getCameraPosition]);

  const [editorOpen, setEditorOpen] = useState(false);
  const handleEdit = useCallback(() => {
    setEditorOpen(true);
  }, []);
  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false);
  }, []);
  const handleSaveCapture = useCallback(
    (newCapture: StoryCapture) => {
      setCaptures(captures.map(c => (c.id === newCapture.id ? newCapture : c)));
      setEditorOpen(false);
    },
    [captures, setCaptures],
  );

  return (
    <List disablePadding>
      <InspectorHeader
        title={"Capture Inspector"}
        iconComponent={layerTypeIcons.STORY_LAYER}
        onClose={handleClose}
        actions={
          <>
            <Tooltip title="レイヤーを選択">
              <IconButton aria-label="レイヤーを選択" onClick={handleSelectLayers}>
                <LayerIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="移動">
              <IconButton aria-label="移動" onClick={handleMove}>
                <AddressIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="削除">
              <IconButton aria-label="削除" onClick={handleRemove}>
                <TrashIcon />
              </IconButton>
            </Tooltip>
          </>
        }
      />
      <Divider />
      <SectionWrapper>
        <Content>
          <CaptureTitle>{capture?.title}</CaptureTitle>
          <ViewMarkdownViewer content={capture?.content} />
        </Content>
        {editMode && (
          <ButtonsWrapper>
            <Button size="small" variant="outlined" fullWidth onClick={handleRecapture}>
              再キャプチャ
            </Button>
            <Button size="small" variant="outlined" fullWidth onClick={handleEdit}>
              編集
            </Button>
          </ButtonsWrapper>
        )}
      </SectionWrapper>
      {editorOpen && (
        <StoryCaptureEditor
          open={editorOpen}
          capture={capture}
          onClose={handleCloseEditor}
          onSave={handleSaveCapture}
        />
      )}
    </List>
  );
};

const SectionWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(2, 0),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

const Content = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  padding: theme.spacing(0, 2),
}));

const CaptureTitle = styled("div")(({ theme }) => ({
  fontSize: theme.typography.h6.fontSize,
}));

const ButtonsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  padding: theme.spacing(0, 2),
}));
