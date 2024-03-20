import { styled } from "@mui/material";

export const CommonContentWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  fontSize: theme.typography.body2.fontSize,
  [`img`]: {
    maxWidth: "100%",
  },
}));
