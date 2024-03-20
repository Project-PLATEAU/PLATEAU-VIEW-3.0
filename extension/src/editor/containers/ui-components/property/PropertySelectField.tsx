import {
  styled,
  TextField,
  TextFieldProps,
  inputBaseClasses,
  selectClasses,
  MenuItem,
} from "@mui/material";

export type PropertySelectFieldProps = TextFieldProps & {
  options: { value: string | number; label: string }[];
};

export const PropertySelectField: React.FC<PropertySelectFieldProps> = ({ options, ...props }) => {
  return (
    <StyledTextField size="small" variant="outlined" fullWidth select {...props}>
      {options.map(option => (
        <StyledMenuItem key={option.value} value={option.value}>
          {option.label}
        </StyledMenuItem>
      ))}
    </StyledTextField>
  );
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  [`.${inputBaseClasses.input}`]: {
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.typography.body2.fontSize,
  },

  [`.${selectClasses.select}`]: {
    padding: `${theme.spacing(0.5, 1)} !important`,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: "1.2",
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  fontSize: theme.typography.body2.fontSize,
  justifyContent: "center",
  minHeight: "28px",
}));
