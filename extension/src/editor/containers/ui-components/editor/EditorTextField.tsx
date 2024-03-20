import { styled, TextField, TextFieldProps, inputBaseClasses } from "@mui/material";

import { EditorCommonField } from "./EditorCommonField";

export type EditorTextFieldProps = TextFieldProps & {
  label?: string;
};

export const EditorTextField: React.FC<EditorTextFieldProps> = ({ label, ...props }) => {
  return (
    <EditorCommonField label={label}>
      <EditorTextInput {...props} />
    </EditorCommonField>
  );
};

export const EditorTextInput: React.FC<TextFieldProps> = ({ ...props }) => {
  return <StyledTextField size="small" variant="outlined" fullWidth {...props} />;
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  [`.${inputBaseClasses.input}`]: {
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.typography.body2.fontSize,
  },
}));
