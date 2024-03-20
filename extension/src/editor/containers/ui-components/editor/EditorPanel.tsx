import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { styled, Paper, PaperProps } from "@mui/material";
import { forwardRef } from "react";

import { EditorButton } from "./EditorButton";

export type EditorPanelProps = PaperProps;

export const EditorPanel = forwardRef<HTMLDivElement, EditorPanelProps>(({ children }, ref) => (
  <StyledPaper ref={ref}>{children}</StyledPaper>
));

export type EditorSectionProps = {
  sidebarMain: React.ReactNode;
  sidebarBottom?: React.ReactNode;
  main: React.ReactNode;
  header?: React.ReactNode;
  saveDisabled?: boolean;
  showSaveButton?: boolean;
  showApplyButton?: boolean;
  onApply?: () => void;
  onSave?: () => void;
};

export const EditorSection: React.FC<EditorSectionProps> = ({
  sidebarMain,
  sidebarBottom,
  main,
  header,
  saveDisabled,
  showSaveButton,
  showApplyButton,
  onSave,
  onApply,
}) => {
  return (
    <ContentWrapper>
      <Sidebar>
        <SidebarMain>{sidebarMain}</SidebarMain>
        {sidebarBottom ? <SidebarBottom>{sidebarBottom}</SidebarBottom> : null}
      </Sidebar>
      <Main>
        {header && <SectionHeader>{header}</SectionHeader>}
        <SectionContent>{main}</SectionContent>
        {(showSaveButton || showApplyButton) && (
          <SectionAction>
            {showApplyButton && (
              <EditorButton
                startIcon={<SaveOutlinedIcon />}
                variant="contained"
                color="primary"
                fullWidth
                onClick={onApply}>
                Apply
              </EditorButton>
            )}
            {showSaveButton && (
              <EditorButton
                startIcon={<SaveOutlinedIcon />}
                variant="contained"
                color="primary"
                fullWidth
                disabled={saveDisabled}
                onClick={onSave}>
                Save
              </EditorButton>
            )}
          </SectionAction>
        )}
      </Main>
    </ContentWrapper>
  );
};

const StyledPaper = styled(Paper)(({ theme, elevation = 4 }) => ({
  position: "relative",
  maxHeight: "100%",
  boxShadow: theme.shadows[elevation],
  pointerEvents: "auto",
  margin: "6px 6px 0 0",
  overflow: "hidden",
}));

const ContentWrapper = styled("div")({
  width: "577px",
  height: "573px",
  display: "flex",
  alignItems: "stretch",
  [`*`]: {
    boxSizing: "border-box",
  },
});

const Sidebar = styled("div")({
  width: "199px",
  height: "573px",
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  borderRight: "1px solid rgba(0, 0, 0, 0.12)",
});

const SidebarMain = styled("div")({
  flex: 1,
  overflow: "auto",
});

const SidebarBottom = styled("div")(({ theme }) => ({
  flexGrow: 0,
  padding: theme.spacing(0.5, 1),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
}));

const Main = styled("div")(({ theme }) => ({
  height: "573px",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  backgroundColor: theme.palette.grey[300],
  maxWidth: "377px",
}));

const SectionHeader = styled("div")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  backgroundColor: theme.palette.background.paper,
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  flexShrink: 0,
}));

const SectionContent = styled("div")(({ theme }) => ({
  flex: 1,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "8px",
  fontSize: theme.typography.body2.fontSize,
}));

const SectionAction = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
}));
