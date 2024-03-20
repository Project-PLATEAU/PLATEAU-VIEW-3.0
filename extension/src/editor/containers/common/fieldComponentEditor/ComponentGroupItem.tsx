import { useCallback, useState, useRef } from "react";

import { ComponentGroup } from "../../../../shared/api/types";
import {
  ComponentGroupSplitButton,
  EditorDialog,
  EditorPopper,
  EditorPopperList,
  EditorPopperListItemButton,
  EditorTextField,
} from "../../ui-components";
import { EditorClickAwayListener } from "../EditorClickAwayListener";

type ComponentGroupItemProps = {
  group: ComponentGroup;
  active?: boolean;
  deleteDisabled?: boolean;
  moveForwardDisabled?: boolean;
  moveBackwardDisabled?: boolean;
  onGroupSelect?: (id: string) => void;
  onGroupRemove?: (id: string) => void;
  onGroupRename?: (id: string, name: string) => void;
  onGroupMove?: (id: string, direction: "forward" | "backward") => void;
};

export const ComponentGroupItem: React.FC<ComponentGroupItemProps> = ({
  group,
  active,
  deleteDisabled,
  moveForwardDisabled,
  moveBackwardDisabled,
  onGroupSelect,
  onGroupRemove,
  onGroupRename,
  onGroupMove,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setMenuOpen(prevOpen => !prevOpen);
  }, []);

  const handleClickAway = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleMainButtonClick = useCallback(() => {
    onGroupSelect?.(group.id);
  }, [group.id, onGroupSelect]);

  const handleDelete = useCallback(() => {
    onGroupRemove?.(group.id);
    setMenuOpen(false);
  }, [group.id, onGroupRemove]);

  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(group.name);

  const handleNewNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  }, []);

  const handleCloseRename = useCallback(() => {
    setRenameOpen(false);
  }, []);

  const handleOpenRename = useCallback(() => {
    setNewName(group.name);
    setRenameOpen(true);
    setMenuOpen(false);
  }, [group.name]);

  const handleRename = useCallback(() => {
    onGroupRename?.(group.id, newName);
    setRenameOpen(false);
  }, [group.id, newName, onGroupRename]);

  const handleMoveForward = useCallback(() => {
    onGroupMove?.(group.id, "forward");
    setMenuOpen(false);
  }, [group.id, onGroupMove]);

  const handleMoveBackward = useCallback(() => {
    onGroupMove?.(group.id, "backward");
    setMenuOpen(false);
  }, [group.id, onGroupMove]);

  return (
    <EditorClickAwayListener onClickAway={handleClickAway}>
      <ComponentGroupSplitButton
        name={group.name}
        buttonRef={anchorRef}
        active={active}
        onMainButtonClick={handleMainButtonClick}
        onSideButtonClick={handleToggle}
      />
      <EditorPopper
        open={menuOpen}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        disablePortal>
        <EditorPopperList>
          <EditorPopperListItemButton onClick={handleOpenRename}>Rename</EditorPopperListItemButton>
          <EditorPopperListItemButton onClick={handleDelete} disabled={deleteDisabled}>
            Delete
          </EditorPopperListItemButton>
          <EditorPopperListItemButton onClick={handleMoveForward} disabled={moveForwardDisabled}>
            Move Forward
          </EditorPopperListItemButton>
          <EditorPopperListItemButton onClick={handleMoveBackward} disabled={moveBackwardDisabled}>
            Move Backward
          </EditorPopperListItemButton>
        </EditorPopperList>
      </EditorPopper>
      <EditorDialog
        open={renameOpen}
        submitDisabled={!newName}
        fullWidth
        title="Rename Component Group"
        onClose={handleCloseRename}
        onSubmit={handleRename}>
        <EditorTextField
          autoFocus
          label="New name"
          fullWidth
          value={newName}
          onChange={handleNewNameChange}
        />
      </EditorDialog>
    </EditorClickAwayListener>
  );
};
