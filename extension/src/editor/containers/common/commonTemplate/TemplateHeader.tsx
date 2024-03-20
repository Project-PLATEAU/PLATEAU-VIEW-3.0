import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { styled, Button, buttonClasses, Alert, AlertTitle } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  EditorDialog,
  EditorPopper,
  EditorPopperList,
  EditorPopperListItemButton,
  EditorTextField,
} from "../../ui-components";
import { EditorClickAwayListener } from "../EditorClickAwayListener";

type TemplateHeaderProps = {
  templateId: string;
  templateName: string;
  templateNames: string[];
  onTemplateRename?: (templateName: string) => void;
  onTemplateRemove?: (templateId: string) => void;
};

export const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  templateId,
  templateName,
  templateNames,
  onTemplateRename,
  onTemplateRemove,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleMenuToggle = useCallback(() => {
    setMenuOpen(prevOpen => !prevOpen);
  }, []);

  const [removeTemplateOpen, setRemoveTemplateOpen] = useState(false);
  const handleOpenRemoveTemplate = useCallback(() => {
    setRemoveTemplateOpen(true);
    setMenuOpen(false);
  }, []);
  const handleCloseRemoveTemplate = useCallback(() => {
    setRemoveTemplateOpen(false);
  }, []);

  const [renameTemplateOpen, setRenameTemplateOpen] = useState(false);
  const handleOpenRenameTemplate = useCallback(() => {
    setRenameTemplateOpen(true);
    setMenuOpen(false);
  }, []);
  const handleCloseRenameTemplate = useCallback(() => {
    setRenameTemplateOpen(false);
    setNewTemplateName(templateName);
  }, [templateName]);

  const [newTemplateName, setNewTemplateName] = useState<string>(templateName);

  useEffect(() => {
    setNewTemplateName(templateName);
  }, [templateName]);

  const handleNewTemplateNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTemplateName(e.target.value);
  }, []);

  const newTemplateNameInvalid = useMemo(() => {
    return (
      templateNames.includes(newTemplateName) ||
      newTemplateName === "" ||
      newTemplateName.endsWith("/") ||
      newTemplateName.split("/").some(p => p === "")
    );
  }, [newTemplateName, templateNames]);

  const handleClickAway = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleTemplateRemove = useCallback(() => {
    onTemplateRemove?.(templateId);
    setRemoveTemplateOpen(false);
  }, [templateId, onTemplateRemove]);

  const handleTemplateRename = useCallback(() => {
    onTemplateRename?.(newTemplateName);
    setRenameTemplateOpen(false);
  }, [newTemplateName, onTemplateRename]);

  return (
    <EditorClickAwayListener onClickAway={handleClickAway}>
      <Wrapper>
        <Title>{templateName}</Title>
        <StyledButton variant="contained" ref={anchorRef} onClick={handleMenuToggle}>
          <MoreVertOutlinedIcon fontSize="small" />
        </StyledButton>
        <EditorPopper
          open={menuOpen}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-end"
          disablePortal>
          <EditorPopperList>
            <EditorPopperListItemButton onClick={handleOpenRenameTemplate}>
              Rename
            </EditorPopperListItemButton>
            <EditorPopperListItemButton onClick={handleOpenRemoveTemplate}>
              Delete
            </EditorPopperListItemButton>
          </EditorPopperList>
        </EditorPopper>
        <EditorDialog
          title="Delete Template"
          open={removeTemplateOpen}
          fullWidth
          primaryButtonText="Delete"
          onClose={handleCloseRemoveTemplate}
          onSubmit={handleTemplateRemove}>
          <Alert severity="error">
            <AlertTitle>Warning</AlertTitle>
            <p>This action cannot be undone.</p>
            <p>
              Are you sure to delete template <strong>{templateName}</strong>?
            </p>
          </Alert>
        </EditorDialog>
        <EditorDialog
          title="Rename Template"
          open={renameTemplateOpen}
          fullWidth
          primaryButtonText="Rename"
          onClose={handleCloseRenameTemplate}
          onSubmit={handleTemplateRename}
          submitDisabled={newTemplateNameInvalid}>
          <EditorTextField
            autoFocus
            label="Full path:"
            fullWidth
            value={newTemplateName}
            onChange={handleNewTemplateNameChange}
          />
        </EditorDialog>
      </Wrapper>
    </EditorClickAwayListener>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1),
  minHeight: "38px",
}));

const Title = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 0),
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
