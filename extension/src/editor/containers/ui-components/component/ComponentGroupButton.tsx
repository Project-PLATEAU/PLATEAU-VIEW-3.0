import { styled, Button, svgIconClasses, buttonBaseClasses } from "@mui/material";

export const ComponentGroupButton = styled(Button)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  backgroundColor: theme.palette.background.paper,

  [`&.${buttonBaseClasses.root}`]: {
    padding: theme.spacing(0, 1),
    borderColor: "transparent",
    height: "32px",
  },

  [`.${svgIconClasses.root}`]: {
    width: "18px",
    color: theme.palette.text.primary,
    marginRight: theme.spacing(0.5),
  },
}));
