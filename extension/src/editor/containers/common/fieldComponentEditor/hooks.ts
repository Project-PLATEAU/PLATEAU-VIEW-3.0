import { useState, useCallback, useEffect, useMemo } from "react";

import { ComponentGroup, SettingComponent } from "../../../../shared/api/types";
import { generateID } from "../../../../shared/utils/id";

import { FieldType } from "./fields";

type Props = {
  componentsGroups: ComponentGroup[];
  onComponentGroupsUpdate: (groups: ComponentGroup[]) => void;
};

export default ({ componentsGroups, onComponentGroupsUpdate }: Props) => {
  const [currentGroupId, setCurrentGroupId] = useState<string | undefined>();

  const currentGroup = useMemo(() => {
    return componentsGroups?.find(g => g.id === currentGroupId);
  }, [currentGroupId, componentsGroups]);

  const handleGroupSelect = useCallback((id: string) => {
    setCurrentGroupId(id);
  }, []);

  const handleGroupCreate = useCallback(() => {
    const newGroup: ComponentGroup = {
      id: generateID(),
      name: "New Group",
      components: [],
    };
    onComponentGroupsUpdate([...componentsGroups, newGroup]);
  }, [componentsGroups, onComponentGroupsUpdate]);

  const handleGroupRemove = useCallback(
    (id: string) => {
      if (componentsGroups.length <= 1) {
        return;
      }
      onComponentGroupsUpdate(componentsGroups.filter(g => g.id !== id));
    },
    [componentsGroups, onComponentGroupsUpdate],
  );

  const handleGroupRename = useCallback(
    (id: string, name: string) => {
      onComponentGroupsUpdate(componentsGroups.map(g => (g.id === id ? { ...g, name } : g)));
    },
    [componentsGroups, onComponentGroupsUpdate],
  );

  const handleGroupMove = useCallback(
    (id: string, direction: "forward" | "backward") => {
      const index = componentsGroups.findIndex(g => g.id === id);
      if (
        index === -1 ||
        (direction === "forward" && index === 0) ||
        (direction === "backward" && index === componentsGroups.length - 1)
      )
        return;
      const newGroups = [...componentsGroups];
      const [removed] = newGroups.splice(index, 1);
      if (direction === "forward") {
        newGroups.splice(index - 1, 0, removed);
      } else {
        newGroups.splice(index + 1, 0, removed);
      }
      onComponentGroupsUpdate(newGroups);
    },
    [componentsGroups, onComponentGroupsUpdate],
  );

  const [movingComponentId, setMovingComponentId] = useState<string | undefined>();

  const handleComponentAdd = useCallback(
    (type: FieldType) => {
      if (!currentGroup) return;
      const newGroup = {
        ...currentGroup,
        components: [...currentGroup.components, { id: generateID(), type }],
      };
      onComponentGroupsUpdate(componentsGroups.map(g => (g.id === currentGroup.id ? newGroup : g)));
    },
    [currentGroup, componentsGroups, onComponentGroupsUpdate],
  );

  const handleComponentUpdate = useCallback(
    (component: SettingComponent) => {
      if (!currentGroup) return;
      const newGroup = {
        ...currentGroup,
        components: currentGroup.components.map(c => (c.id === component.id ? component : c)),
      };
      onComponentGroupsUpdate(componentsGroups.map(g => (g.id === currentGroup.id ? newGroup : g)));
    },
    [componentsGroups, currentGroup, onComponentGroupsUpdate],
  );

  const handleComponentRemove = useCallback(
    (id: string) => {
      if (!currentGroup) return;
      const newGroup = {
        ...currentGroup,
        components: currentGroup.components.filter(c => c.id !== id),
      };
      onComponentGroupsUpdate(componentsGroups.map(g => (g.id === currentGroup.id ? newGroup : g)));
    },
    [componentsGroups, currentGroup, onComponentGroupsUpdate],
  );

  const handleComponentMove = useCallback(
    (id: string, direction: "up" | "down") => {
      if (!currentGroup) return;
      setMovingComponentId(id);
      const index = currentGroup.components.findIndex(c => c.id === id);
      if (
        index === -1 ||
        (direction === "up" && index === 0) ||
        (direction === "down" && index === currentGroup.components.length - 1)
      )
        return;
      const newGroup = {
        ...currentGroup,
        components: [...currentGroup.components],
      };
      const [removed] = newGroup.components.splice(index, 1);
      if (direction === "up") {
        newGroup.components.splice(index - 1, 0, removed);
      } else {
        newGroup.components.splice(index + 1, 0, removed);
      }
      onComponentGroupsUpdate(componentsGroups.map(g => (g.id === currentGroup.id ? newGroup : g)));
    },
    [componentsGroups, currentGroup, onComponentGroupsUpdate],
  );

  // select default group if there is no selected group
  useEffect(() => {
    if (componentsGroups.length > 0 && !currentGroup) {
      setCurrentGroupId(componentsGroups[0].id);
    }
  }, [componentsGroups, currentGroup]);

  // unset moving component id
  useEffect(() => {
    if (movingComponentId) {
      setTimeout(() => {
        if (movingComponentId) setMovingComponentId(undefined);
      }, 200);
    }
  }, [movingComponentId]);

  return {
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
  };
};
