import { styled, TextField, TextFieldProps, inputBaseClasses } from "@mui/material";

export type ViewTextFieldProps = TextFieldProps;

export const ViewTextField: React.FC<ViewTextFieldProps> = ({ ...props }) => {
  return <StyledTextField size="small" variant="outlined" fullWidth {...props} />;
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  [`.${inputBaseClasses.input}`]: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.typography.body2.fontSize,
  },
}));
