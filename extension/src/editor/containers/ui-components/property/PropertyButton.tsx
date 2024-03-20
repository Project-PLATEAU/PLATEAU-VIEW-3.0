import { styled, Button, ButtonProps, buttonClasses, svgIconClasses } from "@mui/material";

export type PropertyButtonProps = ButtonProps;

export const PropertyButton: React.FC<PropertyButtonProps> = ({ children, ...props }) => {
  return (
    <StyledButton variant="outlined" color="primary" {...props}>
      {children}
    </StyledButton>
  );
};

const StyledButton = styled(Button)(({ theme }) => ({
  height: "28px",
  fontSize: theme.typography.body2.fontSize,
  [`&.${buttonClasses.root}`]: {
    minWidth: "28px",
    padding: theme.spacing(0, 0.5),
    display: "flex",
    gap: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
  },
  [`&.${buttonClasses.containedPrimary}`]: {
    color: "#fff",
  },
  [`.${svgIconClasses.root}`]: {
    width: "18px",
  },
}));
