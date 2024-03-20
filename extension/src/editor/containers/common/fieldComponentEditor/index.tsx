import { styled } from "@mui/material";

import { ComponentGroup } from "../../../../shared/api/types";

import { ComponentAddButton } from "./ComponentAddButton";
import { ComponentGroups } from "./ComponentGroups";
import { ComponentItem } from "./ComponentItem";
import useHooks from "./hooks";

type FieldComponentEditorProps = {
  componentsGroups: ComponentGroup[];
  hidden?: boolean;
  onComponentGroupsUpdate: (groups: ComponentGroup[]) => void;
};

export const FieldComponentEditor: React.FC<FieldComponentEditorProps> = ({
  componentsGroups,
  hidden,
  onComponentGroupsUpdate,
}) => {
  const {
    currentGroup,
    movingComponentId,
    handleGroupSelect,
    handleGroupCreate,
    handleGroupRemove,
    handleGroupRename,
    handleGroupMove,
    handleComponentAdd,
    handleComponentUpdate,
    handleComponentRemove,
    handleComponentMove,
  } = useHooks({ componentsGroups, onComponentGroupsUpdate });

  return (
    <FieldComponentEditorWrapper hidden={hidden}>
      <ComponentGroups
        groups={componentsGroups}
        currentGroup={currentGroup}
        onGroupSelect={handleGroupSelect}
        onGroupCreate={handleGroupCreate}
        onGroupRemove={handleGroupRemove}
        onGroupRename={handleGroupRename}
        onGroupMove={handleGroupMove}
      />
      {currentGroup?.components.map((component, index) => (
        <ComponentItem
          key={component.id}
          movingComponentId={movingComponentId}
          moveUpDisabled={index === 0}
          moveDownDisabled={index === currentGroup.components.length - 1}
          component={component}
          onComponentUpdate={handleComponentUpdate}
          onComponentRemove={handleComponentRemove}
          onComponentMove={handleComponentMove}
        />
      ))}
      {currentGroup && (
        <ComponentAddButton currentGroup={currentGroup} onComponentAdd={handleComponentAdd} />
      )}
    </FieldComponentEditorWrapper>
  );
};

const FieldComponentEditorWrapper = styled("div")<{ hidden?: boolean }>(({ theme, hidden }) => ({
  display: hidden ? "none" : "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));
