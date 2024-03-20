import { useMemo, useState, useRef, useCallback } from "react";

import { SettingComponent } from "../../../../shared/api/types";
import {
  ComponentCard,
  EditorPopper,
  EditorPopperList,
  EditorPopperListItemButton,
  PropertyInfo,
} from "../../ui-components";
import { EditorClickAwayListener } from "../EditorClickAwayListener";

import { BasicFieldProps, FieldType, fields } from "./fields";
import { FieldGroupTypes, fieldGroupTitles } from "./fields/constants";

type ComponentItemProps = {
  component: SettingComponent<FieldType>;
  movingComponentId?: string;
  moveUpDisabled?: boolean;
  moveDownDisabled?: boolean;
  onComponentUpdate: (component: SettingComponent) => void;
  onComponentRemove: (id: string) => void;
  onComponentMove: (id: string, direction: "up" | "down") => void;
};

export const ComponentItem: React.FC<ComponentItemProps> = ({
  component,
  movingComponentId,
  moveUpDisabled,
  moveDownDisabled,
  onComponentUpdate,
  onComponentRemove,
  onComponentMove,
}) => {
  const FieldComponent = useMemo(
    () => fields[component.type]?.Component as React.FC<BasicFieldProps<FieldType>>,
    [component.type],
  );
  const title = useMemo(
    () =>
      fields[component.type]
        ? fields[component.type].group
          ? `${fields[component.type].category} / ${
              fieldGroupTitles[fields[component.type].group as FieldGroupTypes]
            } / ${fields[component.type].name}`
          : `${fields[component.type].category} / ${fields[component.type].name}`
        : component.type,
    [component.type],
  );

  const componentNotFound = useMemo(() => !fields[component.type], [component.type]);

  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleMoreClick = useCallback(() => {
    setMenuOpen(prevOpen => !prevOpen);
  }, []);

  const handleClickAway = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    onComponentRemove(component.id);
    setMenuOpen(false);
  }, [component.id, onComponentRemove]);

  const handleMoveUp = useCallback(() => {
    onComponentMove?.(component.id, "up");
    setMenuOpen(false);
  }, [component.id, onComponentMove]);

  const handleMoveDown = useCallback(() => {
    onComponentMove?.(component.id, "down");
    setMenuOpen(false);
  }, [component.id, onComponentMove]);

  const moving = useMemo(
    () => movingComponentId === component.id,
    [movingComponentId, component.id],
  );

  return (
    <EditorClickAwayListener onClickAway={handleClickAway}>
      <ComponentCard
        title={title}
        moreButtonRef={anchorRef}
        error={componentNotFound}
        onMoreClick={handleMoreClick}
        highlight={moving}>
        {componentNotFound ? (
          <PropertyInfo preset="field-not-found" />
        ) : (
          <FieldComponent component={component} onUpdate={onComponentUpdate} />
        )}
      </ComponentCard>
      <EditorPopper
        open={menuOpen}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        disablePortal>
        <EditorPopperList>
          <EditorPopperListItemButton onClick={handleDelete}>Delete</EditorPopperListItemButton>
          <EditorPopperListItemButton onClick={handleMoveUp} disabled={moveUpDisabled}>
            Move Up
          </EditorPopperListItemButton>
          <EditorPopperListItemButton onClick={handleMoveDown} disabled={moveDownDisabled}>
            Move Down
          </EditorPopperListItemButton>
        </EditorPopperList>
      </EditorPopper>
    </EditorClickAwayListener>
  );
};
