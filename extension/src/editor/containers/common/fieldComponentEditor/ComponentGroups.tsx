import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { styled } from "@mui/material";

import { ComponentGroup } from "../../../../shared/api/types";
import { ComponentGroupButton } from "../../ui-components";

import { ComponentGroupItem } from "./ComponentGroupItem";

type ComponentGroupsProps = {
  groups: ComponentGroup[];
  currentGroup: ComponentGroup | undefined;
  onGroupSelect: (id: string) => void;
  onGroupCreate: () => void;
  onGroupRemove: (id: string) => void;
  onGroupRename: (id: string, name: string) => void;
  onGroupMove: (id: string, direction: "forward" | "backward") => void;
};

export const ComponentGroups: React.FC<ComponentGroupsProps> = ({
  groups,
  currentGroup,
  onGroupSelect,
  onGroupCreate,
  onGroupRemove,
  onGroupRename,
  onGroupMove,
}) => {
  return (
    <GroupsWrapper>
      {groups.map((group, index) => (
        <ComponentGroupItem
          key={group.id}
          group={group}
          active={group.id === currentGroup?.id}
          deleteDisabled={groups.length <= 1}
          moveForwardDisabled={index === 0}
          moveBackwardDisabled={index === groups.length - 1}
          onGroupSelect={onGroupSelect}
          onGroupRemove={onGroupRemove}
          onGroupRename={onGroupRename}
          onGroupMove={onGroupMove}
        />
      ))}
      <ComponentGroupButton variant="outlined" onClick={onGroupCreate}>
        <AddOutlinedIcon />
        Group
      </ComponentGroupButton>
    </GroupsWrapper>
  );
};

const GroupsWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0),
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));
