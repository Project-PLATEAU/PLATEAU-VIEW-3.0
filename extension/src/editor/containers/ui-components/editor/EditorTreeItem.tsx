import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import EditIcon from "@mui/icons-material/Edit";
import {
  styled,
  ListItemIcon,
  listItemIconClasses,
  listItemTextClasses,
  svgIconClasses,
  typographyClasses,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useCallback, useMemo } from "react";

export type EditorTreeItemType = {
  id: string;
  name: string;
  property?: any;
  edited?: boolean;
  children?: EditorTreeItemType[];
};

export type EditorTreeSelection = { id: string } & EditorTreeItemType["property"];

type EditorTreeItemProps = {
  item: EditorTreeItemType;
  level: number;
  selected?: string;
  expanded: string[];
  showEditedIcon?: boolean;
  clickFolderToExpand?: boolean;
  onItemClick?: (selection: EditorTreeSelection) => void;
  onExpandClick?: (id: string) => void;
};

export const EditorTreeItem: React.FC<EditorTreeItemProps> = ({
  item,
  level,
  selected,
  expanded,
  showEditedIcon,
  clickFolderToExpand,
  onItemClick,
  onExpandClick,
}) => {
  const localSelected = useMemo(() => selected === item.id, [selected, item.id]);
  const localExpanded = useMemo(() => expanded.includes(item.id), [expanded, item.id]);

  const handleClick = useCallback(() => {
    onItemClick?.({ id: item.id, ...item.property });
    if (clickFolderToExpand && item.children && item.children.length > 0) {
      onExpandClick?.(item.id);
    }
  }, [clickFolderToExpand, item, onItemClick, onExpandClick]);

  const handleOpen = useCallback(() => {
    onExpandClick?.(item.id);
  }, [item, onExpandClick]);

  return (
    <>
      <StyledItemButton
        onClick={handleClick}
        level={level}
        selected={localSelected}
        expanded={localExpanded}>
        <ListItemIcon onClick={handleOpen}>
          {item.children ? <ArrowRightIcon /> : null}
        </ListItemIcon>
        <ListItemText primary={item.name} />
        {showEditedIcon && <EditIcon className="edited-icon" />}
      </StyledItemButton>
      {item.children ? (
        <Collapse in={localExpanded}>
          <StyledList>
            {item.children.map(child => (
              <EditorTreeItem
                key={child.id}
                item={child}
                level={level + 1}
                selected={selected}
                expanded={expanded}
                showEditedIcon={child.edited}
                clickFolderToExpand={clickFolderToExpand}
                onItemClick={onItemClick}
                onExpandClick={onExpandClick}
              />
            ))}
          </StyledList>
        </Collapse>
      ) : null}
    </>
  );
};

const StyledList = styled(List)(() => ({
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "4px",
}));

const StyledItemButton = styled(ListItemButton, {
  shouldForwardProp: props => props !== "expanded",
})<{
  level: number;
  selected: boolean;
  expanded: boolean;
}>(({ theme, level, selected, expanded }) => ({
  paddingLeft: level === -1 ? theme.spacing(0.5) : theme.spacing(0.5 + level),
  paddingRight: 0,
  color: selected ? "#fff" : theme.palette.text.primary,
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  borderRadius: "4px",
  height: "auto",
  backgroundColor: selected ? `${theme.palette.primary.main} !important` : "transparent",

  [`.${listItemIconClasses.root}`]: {
    minWidth: "20px",
    height: "18px",
  },

  [`.${listItemTextClasses.root}`]: {
    margin: 0,
  },

  [`.${svgIconClasses.root}`]: {
    transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
    transition: "transform 0.2s ease-in-out",
    color: selected ? "#fff" : theme.palette.text.primary,
    width: "18px",
    height: "18px",
  },

  [`.${typographyClasses.root}`]: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: "1.45",
  },

  [`.${svgIconClasses.root}.edited-icon`]: {
    transform: "rotate(0deg)",
    color: selected ? "#fff" : theme.palette.text.primary,
    width: "10px",
    height: "10px",
    marginRight: theme.spacing(1),
  },
}));
