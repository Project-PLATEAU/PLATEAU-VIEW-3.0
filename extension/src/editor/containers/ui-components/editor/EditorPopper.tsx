import { styled, Popper } from "@mui/material";

export const EditorPopper = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.modal,
}));
