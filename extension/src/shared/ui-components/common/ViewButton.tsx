import {
  ButtonProps,
  Button as MuiButton,
  buttonClasses,
  styled,
  svgIconClasses,
} from "@mui/material";
import { FC } from "react";

type ViewButtonProps = ButtonProps;

export const ViewButton: FC<ViewButtonProps> = ({ children, ...props }) => {
  return (
    <StyledButton variant="contained" size="medium" {...props}>
      {children}
    </StyledButton>
  );
};

export const StyledButton = styled(MuiButton)(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  fontWeight: theme.typography.body1.fontWeight,
  [`&.${buttonClasses.containedPrimary}`]: {
    color: "#fff",
  },
  [`.${svgIconClasses.root}`]: {
    width: "18px",
    marginRight: theme.spacing(0.5),
  },
}));
