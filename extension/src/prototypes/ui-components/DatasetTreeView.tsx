import { TreeView, type TreeViewProps } from "@mui/lab";
import { styled } from "@mui/material";
import { type FC } from "react";

import { TreeArrowCollapsedIcon, TreeArrowExpandedIcon } from "./icons";

const StyledTreeView = styled(TreeView)<{ maxheight?: number }>(({ theme, maxheight }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  boxSizing: "border-box",
  maxHeight: maxheight,
}));

export type DatasetTreeViewProps = TreeViewProps & { maxheight?: number };

export const DatasetTreeView: FC<DatasetTreeViewProps> = props => (
  <StyledTreeView
    defaultCollapseIcon={<TreeArrowExpandedIcon />}
    defaultExpandIcon={<TreeArrowCollapsedIcon />}
    {...props}
  />
);
