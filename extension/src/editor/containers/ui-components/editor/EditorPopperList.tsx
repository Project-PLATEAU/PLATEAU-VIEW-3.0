import { styled, List, ListItemButton } from "@mui/material";

export const EditorPopperList = styled(List)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  padding: theme.spacing(0.5, 0),
}));

export const EditorPopperListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(0.5, 2),
}));
