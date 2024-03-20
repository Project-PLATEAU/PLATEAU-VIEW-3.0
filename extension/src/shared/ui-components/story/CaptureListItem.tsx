import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { Button, buttonClasses, styled } from "@mui/material";
import { FC, useCallback, useMemo, useRef, useState } from "react";

import { StoryCapture } from "../../layerContainers/story";
import { useCamera } from "../../reearth/hooks";
import { StoryCaptureEditor } from "../../view/ui-container/story/StoryCaptureEditor";
import { ViewClickAwayListener } from "../common";
import { ViewActionsMenu } from "../common/ViewActionsMenu";

type CaptureListItemProps = {
  capture: StoryCapture;
  onCaptureUpdate?: (capture: StoryCapture) => void;
  onCaptureRemove?: (id: string) => void;
};

export const CaptureListItem: FC<CaptureListItemProps> = ({
  capture,
  onCaptureUpdate,
  onCaptureRemove,
}) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const { flyTo, getCameraPosition } = useCamera();

  const viewCapture = useCallback(() => {
    flyTo(capture.camera);
    setActionsOpen(false);
  }, [capture.camera, flyTo]);

  const editCapture = useCallback(() => {
    setEditorOpen(true);
    setActionsOpen(false);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false);
  }, []);

  const handleSaveCapture = useCallback(
    (newCapture: StoryCapture) => {
      onCaptureUpdate?.(newCapture);
      setEditorOpen(false);
    },
    [onCaptureUpdate],
  );

  const recaptureCapture = useCallback(() => {
    setActionsOpen(false);
    const camera = getCameraPosition();
    if (!camera) return;
    onCaptureUpdate?.({ ...capture, camera });
  }, [capture, getCameraPosition, onCaptureUpdate]);

  const removeCapture = useCallback(() => {
    onCaptureRemove?.(capture.id);
    setActionsOpen(false);
  }, [capture.id, onCaptureRemove]);

  const actions = useMemo(
    () => [
      {
        label: "移動",
        onClick: viewCapture,
      },
      {
        label: "編集",
        onClick: editCapture,
      },
      {
        label: "再キャプチャ",
        onClick: recaptureCapture,
      },
      {
        label: "削除",
        onClick: removeCapture,
      },
    ],
    [viewCapture, editCapture, recaptureCapture, removeCapture],
  );

  const handleActionsButtonClick = useCallback(() => {
    setActionsOpen(prevOpen => !prevOpen);
  }, []);

  const handleClickAway = useCallback(() => {
    setActionsOpen(false);
  }, []);

  return (
    <>
      <Wrapper>
        <ItemHeader>
          <Title>{capture.title}</Title>
          <ViewClickAwayListener onClickAway={handleClickAway}>
            <ActionsButton variant="contained" ref={anchorRef} onClick={handleActionsButtonClick}>
              <MoreVertOutlinedIcon fontSize="small" />
            </ActionsButton>
          </ViewClickAwayListener>
        </ItemHeader>
      </Wrapper>
      <ViewActionsMenu open={actionsOpen} anchorEl={anchorRef.current} actions={actions} />
      {editorOpen && (
        <StoryCaptureEditor
          open={editorOpen}
          capture={capture}
          onClose={handleCloseEditor}
          onSave={handleSaveCapture}
        />
      )}
    </>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0.4, 1),
  border: `1px solid rgba(0, 0, 0, 0.23)`,
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const ItemHeader = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const Title = styled("div")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
}));

const ActionsButton = styled(Button)(({ theme }) => ({
  [`&.${buttonClasses.root}`]: {
    height: "28px",
    width: "28px",
    minWidth: "28px",
    padding: theme.spacing(0),
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "none",
  },
}));
