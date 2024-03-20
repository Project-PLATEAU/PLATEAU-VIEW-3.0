import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { styled, Paper, Collapse, Divider, Button, buttonClasses } from "@mui/material";
import { useState, useCallback, MouseEventHandler } from "react";

type ComponentCardProps = {
  title: string;
  moreButtonRef?: React.RefObject<HTMLButtonElement>;
  highlight?: boolean;
  error?: boolean;
  onMoreClick?: () => void;
  children?: React.ReactNode;
};

export const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  moreButtonRef,
  highlight,
  error,
  onMoreClick,
  children,
}) => {
  const [expanded, setExpanded] = useState(true);

  const handleTitleClick = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const handleMoreClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    e => {
      e.stopPropagation();
      onMoreClick?.();
    },
    [onMoreClick],
  );

  return (
    <StyledPaper highlight={highlight ? 1 : 0}>
      <TitleBar onClick={handleTitleClick} error={error ? 1 : 0}>
        <ComponentTitle>
          <StyledIcon expanded={expanded ? 1 : 0} />
          {title}
        </ComponentTitle>
        <StyledButton variant="contained" ref={moreButtonRef} onClick={handleMoreClick}>
          <MoreVertOutlinedIcon fontSize="small" />
        </StyledButton>
      </TitleBar>
      <StyledCollapse in={expanded}>
        <Divider />
        {children}
      </StyledCollapse>
    </StyledPaper>
  );
};

const StyledPaper = styled(Paper)<{ highlight?: number }>(({ theme, highlight }) => ({
  boxShadow: highlight ? `0 0 10px ${theme.palette.info.main}` : theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
  transition: highlight ? "none" : "box-shadow 0.75s ease-out",
  overflow: "hidden",
}));

const TitleBar = styled("div")<{ error?: number }>(({ theme, error }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  height: "30px",
  userSelect: "none",
  color: error ? theme.palette.error.main : "inherit",
}));

const ComponentTitle = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  gap: "2px",
}));

const StyledIcon = styled(ArrowRightIcon)<{ expanded: number; error?: number }>(
  ({ theme, expanded, error }) => ({
    display: "flex",
    alignItems: "center",
    width: "18px",
    transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
    transition: "transform 0.2s ease-in-out",
    color: error ? theme.palette.error.main : "inherit",
  }),
);

const StyledCollapse = styled(Collapse)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  boxSizing: "border-box",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  [`&.${buttonClasses.root}`]: {
    height: "28px",
    width: "28px",
    minWidth: "28px",
    padding: theme.spacing(0),
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "none",
    borderRadius: "0",
  },
}));
