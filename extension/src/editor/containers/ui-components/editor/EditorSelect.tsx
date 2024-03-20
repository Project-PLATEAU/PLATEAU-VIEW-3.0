import {
  styled,
  TextField,
  TextFieldProps,
  inputBaseClasses,
  selectClasses,
  MenuItem,
} from "@mui/material";

import { EditorCommonField } from "./EditorCommonField";

export type EditorSelectProps = TextFieldProps & {
  label?: string;
  options: { value: string; label: string }[];
};

export const EditorSelect: React.FC<EditorSelectProps> = ({ label, options, ...props }) => {
  return (
    <EditorCommonField label={label}>
      <StyledTextField size="small" variant="outlined" fullWidth select {...props}>
        {options.map(option => (
          <StyledMenuItem key={option.value} value={option.value}>
            {option.label}
          </StyledMenuItem>
        ))}
      </StyledTextField>
    </EditorCommonField>
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
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  fontSize: theme.typography.body2.fontSize,
  minHeight: "28px",
}));
