import { styled } from "@mui/material";
import { FC } from "react";

import { StoryCapture } from "../../view-layers";

import { CaptureListItem } from "./CaptureListItem";

type CaptureListProps = {
  captures: StoryCapture[];
  onCaptureUpdate?: (capture: StoryCapture) => void;
  onCaptureRemove?: (id: string) => void;
  onCaptureClick?: (index: number) => void;
};

export const CaptureList: FC<CaptureListProps> = ({
  captures,
  onCaptureUpdate,
  onCaptureRemove,
  onCaptureClick,
}) => {
  return captures.length > 0 ? (
    <Wrapper>
      {captures.map((capture, index) => (
        <CaptureListItem
          key={capture.id}
          index={index}
          capture={capture}
          onCaptureUpdate={onCaptureUpdate}
          onCaptureRemove={onCaptureRemove}
          onCaptureClick={onCaptureClick}
        />
      ))}
    </Wrapper>
  ) : null;
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  padding: theme.spacing(0, 2),
}));
