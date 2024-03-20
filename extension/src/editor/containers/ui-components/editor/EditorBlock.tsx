import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { Button, buttonClasses, styled } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { useState, useCallback, useRef } from "react";

import { EditorClickAwayListener } from "../../common/EditorClickAwayListener";

import { EditorPopper } from "./EditorPopper";
import { EditorPopperList, EditorPopperListItemButton } from "./EditorPopperList";

export type EditorBlockProps = {
  title?: string;
  expandable?: boolean;
  expanded?: boolean;
  actions?: { label: string; onClick?: () => void }[];
  children?: React.ReactNode;
};

export const EditorBlock: React.FC<EditorBlockProps> = ({
  title,
  expandable,
  expanded,
  actions,
  children,
}) => {
  const [localExpaned, setExpanded] = useState(expanded === undefined ? true : expanded);

  const handleTitleClick = useCallback(() => {
    if (!expandable) return;
    setExpanded(prev => !prev);
  }, [expandable]);

  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleMoreClick = useCallback(() => {
    setMenuOpen(prevOpen => !prevOpen);
  }, []);

  const handleClickAway = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleActionClick = useCallback((onClick?: () => void) => {
    setMenuOpen(false);
    onClick?.();
  }, []);

  return (
    <EditorClickAwayListener onClickAway={handleClickAway}>
      <BlockWrapper>
        <BlockHeader>
          <BlockTitle expandable={!!expandable} onClick={handleTitleClick}>
            {expandable && <StyledIcon expanded={localExpaned ? 1 : 0} />}
            {title}
          </BlockTitle>
          {actions && (
            <StyledButton variant="contained" ref={anchorRef} onClick={handleMoreClick}>
              <MoreVertOutlinedIcon fontSize="small" />
            </StyledButton>
          )}
        </BlockHeader>
        <Collapse in={localExpaned || !expandable}>
          <BlockContent>{children}</BlockContent>
        </Collapse>
      </BlockWrapper>
      {actions && (
        <EditorPopper
          open={menuOpen}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-end"
          disablePortal>
          {actions.map((action, index) => (
            <EditorPopperList key={index}>
              <EditorPopperListItemButton onClick={() => handleActionClick(action.onClick)}>
                {action.label}
              </EditorPopperListItemButton>
            </EditorPopperList>
          ))}
        </EditorPopper>
      )}
    </EditorClickAwayListener>
  );
};

const BlockWrapper = styled("div")({});

const BlockHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "34px",
  backgroundColor: theme.palette.background.paper,
}));

const BlockTitle = styled("div")<{ expandable: boolean }>(({ expandable }) => ({
  display: "flex",
  alignItems: "center",
  cursor: expandable ? "pointer" : "default",
  padding: expandable ? "0 8px 0 4px" : "0 8px",
}));

const StyledIcon = styled(ArrowRightIcon)<{ expanded: number }>(({ expanded }) => ({
  display: "flex",
  alignItems: "center",
  width: "24px",
  transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
  transition: "transform 0.2s ease-in-out",
}));

const BlockContent = styled("div")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  backgroundColor: theme.palette.grey[100],
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

export const BlockContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
}));
