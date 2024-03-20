import { styled, TextField, TextFieldProps, inputBaseClasses } from "@mui/material";

type PropertyTextareaFieldProps = TextFieldProps;

export const PropertyTextareaField: React.FC<PropertyTextareaFieldProps> = ({ ...props }) => {
  return (
    <StyledTextField size="small" variant="outlined" fullWidth multiline minRows={5} {...props} />
  );
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  [`.${inputBaseClasses.root}`]: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: 0,
  },

  [`.${inputBaseClasses.input}`]: {
    padding: theme.spacing(0.5, 1),
    fontSize: theme.typography.body2.fontSize,
  },
}));
