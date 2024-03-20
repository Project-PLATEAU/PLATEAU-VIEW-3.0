import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Button,
  Pagination,
  Stack,
  buttonClasses,
  paginationItemClasses,
  styled,
} from "@mui/material";
import { useAtomValue } from "jotai";
import { FC, useCallback, useEffect, useState } from "react";

import { useCamera } from "../../../shared/reearth/hooks";
import { ViewMarkdownViewer } from "../../../shared/ui-components/common";
import { LayerModel } from "../../layers";
import { STORY_LAYER } from "../../view-layers";

type StoryInspectSectionProps = {
  layer: LayerModel<typeof STORY_LAYER>;
};

export const StoryInspectSection: FC<StoryInspectSectionProps> = ({ layer }) => {
  const [panel, setPanel] = useState<"list" | "player">("list");
  const captures = useAtomValue(layer.capturesAtom);
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);
  const { flyTo } = useCamera();

  const handleChange = useCallback(
    (_: React.ChangeEvent<unknown>, value: number) => {
      const index = value - 1;
      setCurrentCaptureIndex(index);
      flyTo(captures[index].camera);
    },
    [flyTo, captures],
  );

  const goCapture = useCallback(
    (captureIndex: number) => {
      setPanel("player");
      setCurrentCaptureIndex(captureIndex);
      flyTo(captures[captureIndex].camera);
    },
    [captures, flyTo],
  );

  const goList = useCallback(() => {
    setPanel("list");
  }, []);

  useEffect(() => {
    setPanel("list");
  }, [layer]);

  return (
    <SectionWrapper>
      {captures.length > 0 ? (
        panel === "list" ? (
          <Content>
            {captures.map((capture, index) => (
              <StyledButton
                key={index}
                size="small"
                variant="outlined"
                fullWidth
                onClick={() => {
                  goCapture(index);
                }}>
                {capture.title}
              </StyledButton>
            ))}
          </Content>
        ) : (
          <>
            <ActionWrapper>
              <BackButton variant="contained" onClick={goList}>
                <ArrowBackIcon fontSize="medium" />
              </BackButton>
            </ActionWrapper>
            <Content>
              <CaptureTitle>{captures[currentCaptureIndex].title}</CaptureTitle>
              <ViewMarkdownViewer content={captures[currentCaptureIndex].content} />
            </Content>
            <PaginationWrapper>
              <StyledPagination
                count={captures.length}
                color="primary"
                size="small"
                shape="rounded"
                page={currentCaptureIndex + 1}
                siblingCount={1}
                boundaryCount={1}
                onChange={handleChange}
              />
            </PaginationWrapper>
          </>
        )
      ) : (
        <NoCaptures>キャプチャがありません。</NoCaptures>
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

const PaginationWrapper = styled("div")(() => ({
  display: "flex",
  justifyContent: "center",
}));

const StyledPagination = styled(Pagination)(({ theme }) => ({
  margin: theme.spacing(1, 0, 0, 0),
  [`.${paginationItemClasses.root}.Mui-selected`]: {
    color: "#fff",
  },
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

const NoCaptures = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.secondary,
  padding: theme.spacing(1),
}));

const StyledButton = styled(Button)(() => ({
  justifyContent: "flex-start",
  [`span`]: {
    overflow: "hidden",
    whteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
}));

const ActionWrapper = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(0, 1),
}));

const BackButton = styled(Button)(({ theme }) => ({
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
