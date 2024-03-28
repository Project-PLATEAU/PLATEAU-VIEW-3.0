import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { Button, buttonClasses, styled } from "@mui/material";
import { FC, useCallback, useMemo, useRef, useState } from "react";

import { useCamera } from "../../reearth/hooks";
import { StoryCaptureEditor } from "../../view/ui-container/story/StoryCaptureEditor";
import { StoryCapture } from "../../view-layers";
import { ViewClickAwayListener } from "../common";
import { ViewActionsMenu } from "../common/ViewActionsMenu";

type CaptureListItemProps = {
  capture: StoryCapture;
  index: number;
  hideActions?: boolean;
  onCaptureUpdate?: (capture: StoryCapture) => void;
  onCaptureRemove?: (id: string) => void;
  onCaptureClick?: (index: number) => void;
};

export const CaptureListItem: FC<CaptureListItemProps> = ({
  capture,
  index,
  hideActions = true,
  onCaptureUpdate,
  onCaptureRemove,
  onCaptureClick,
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

  const handleTitleClick = useCallback(() => {
    onCaptureClick?.(index);
  }, [index, onCaptureClick]);

  return (
    <>
      <Wrapper>
        <ItemHeader>
          <Title onClick={handleTitleClick}>{capture.title}</Title>
          {!hideActions && (
            <ViewClickAwayListener onClickAway={handleClickAway}>
              <ActionsButton variant="contained" ref={anchorRef} onClick={handleActionsButtonClick}>
                <MoreVertOutlinedIcon fontSize="small" />
              </ActionsButton>
            </ViewClickAwayListener>
          )}
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
  flex: 1,
  cursor: "pointer",
  padding: theme.spacing(0.5, 0),
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
    flexShrink: 0,
  },
}));
