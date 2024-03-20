import { styled, TextField, TextFieldProps, inputBaseClasses } from "@mui/material";

export type PropertyInputFieldProps = TextFieldProps;

export const PropertyInputField: React.FC<PropertyInputFieldProps> = ({ ...props }) => {
  return <StyledTextField size="small" variant="outlined" fullWidth {...props} />;
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  [`.${inputBaseClasses.root}`]: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5, 1),
  },

  [`.${inputBaseClasses.input}`]: {
    padding: 0,
    fontSize: theme.typography.body2.fontSize,
  },

  [`input::-webkit-outer-spin-button, input::-webkit-inner-spin-button`]: {
    display: "none",
  },
}));
