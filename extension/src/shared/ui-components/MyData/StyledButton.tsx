import { Button, styled } from "@mui/material";

export const StyledButton = styled(Button)(({ theme, disabled }) => ({
  display: "flex",
  padding: theme.spacing(1),
  color: theme.palette.text.primary,
  backgroundColor: disabled ? theme.palette.grey[50] : theme.palette.primary.main,
  borderRadius: "4px",
  marginLeft: "auto",
  "&:hover": {
    backgroundColor: !disabled && theme.palette.primary.main,
  },
}));
