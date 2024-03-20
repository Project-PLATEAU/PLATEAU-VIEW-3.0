import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EditorButton, EditorDialog, EditorTextField } from "../../ui-components";

type TemplateAddButtonProps = {
  base: string;
  templateNames: string[];
  disabled?: boolean;
  onTemplateAdd: (name: string) => void;
};

export const TemplateAddButton: React.FC<TemplateAddButtonProps> = ({
  base,
  templateNames,
  disabled,
  onTemplateAdd,
}) => {
  const [addTemplateOpen, setAddTemplateOpen] = useState(false);

  const handleOpenAddTemplate = useCallback(() => {
    setAddTemplateOpen(true);
  }, []);

  const handleCloseAddTemplate = useCallback(() => {
    setAddTemplateOpen(false);
  }, []);

  const [newTemplateName, setNewTemplateName] = useState<string>(base);

  useEffect(() => {
    setNewTemplateName(base);
  }, [base]);

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

  const handleTemplateAdd = useCallback(() => {
    onTemplateAdd(newTemplateName);
    setAddTemplateOpen(false);
  }, [newTemplateName, onTemplateAdd]);

  return (
    <>
      <EditorButton
        startIcon={<AddOutlinedIcon />}
        color="primary"
        fullWidth
        disabled={disabled}
        onClick={handleOpenAddTemplate}>
        New Template
      </EditorButton>
      <EditorDialog
        title="Create New Template"
        open={addTemplateOpen}
        fullWidth
        primaryButtonText="Add"
        onClose={handleCloseAddTemplate}
        onSubmit={handleTemplateAdd}
        submitDisabled={newTemplateNameInvalid}>
        <EditorTextField
          autoFocus
          label="Full path:"
          fullWidth
          value={newTemplateName}
          onChange={handleNewTemplateNameChange}
        />
      </EditorDialog>
    </>
  );
};
