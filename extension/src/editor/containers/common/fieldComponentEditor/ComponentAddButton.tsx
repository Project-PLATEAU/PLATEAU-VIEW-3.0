import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useCallback, useState, useMemo } from "react";

import { ComponentGroup } from "../../../../shared/api/types";
import { ComponentSelector, EditorButton, EditorDialog } from "../../ui-components";

import { type FieldType, getFiledComponentTree, fields } from "./fields";

type ComponentAddButtonProps = {
  currentGroup: ComponentGroup | undefined;
  onComponentAdd?: (type: FieldType) => void;
};

export const ComponentAddButton: React.FC<ComponentAddButtonProps> = ({
  currentGroup,
  onComponentAdd,
}) => {
  const [addComponentOpen, setAddComponentOpen] = useState(false);

  const handleOpenAddComponent = useCallback(() => {
    setAddComponentOpen(true);
  }, []);

  const handleCloseAddComponent = useCallback(() => {
    setAddComponentOpen(false);
  }, []);

  const componentTree = useMemo(() => getFiledComponentTree(), []);

  const [newComponentType, setNewComponentType] = useState<FieldType>();

  const handleComponentTypeSelect = useCallback((type: string) => {
    setNewComponentType(type as FieldType);
  }, []);

  const handleComponentAdd = useCallback(() => {
    if (!newComponentType) return;
    onComponentAdd?.(newComponentType);
    setAddComponentOpen(false);
  }, [newComponentType, onComponentAdd]);

  const existFields = useMemo(() => {
    const types: string[] = [];
    currentGroup?.components.forEach(component => {
      if (!types.includes(component.type)) {
        types.push(component.type);
      }
    });
    return types;
  }, [currentGroup]);

  const existFieldGroups = useMemo(() => {
    const groups: string[] = [];
    currentGroup?.components.forEach(component => {
      const group = fields[component.type]?.group;
      if (group && !groups.includes(group)) {
        groups.push(group);
      }
    });
    return groups;
  }, [currentGroup]);

  return (
    <>
      <EditorButton variant="contained" fullWidth onClick={handleOpenAddComponent}>
        <AddOutlinedIcon />
        Add Component
      </EditorButton>
      <EditorDialog
        title="Add Component"
        open={addComponentOpen}
        fullWidth
        maxWidth="mobile"
        primaryButtonText="Add"
        onClose={handleCloseAddComponent}
        onSubmit={handleComponentAdd}
        submitDisabled={!newComponentType}>
        <ComponentSelector
          tree={componentTree}
          existFieldGroups={existFieldGroups}
          existFields={existFields}
          onComponentSelect={handleComponentTypeSelect}
          onComponentDoubleClick={handleComponentAdd}
        />
      </EditorDialog>
    </>
  );
};
