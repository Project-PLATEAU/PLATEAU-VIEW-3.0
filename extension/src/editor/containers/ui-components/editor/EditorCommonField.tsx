import { styled } from "@mui/material";

type EditorCommonFieldProps = {
  label?: string;
  inline?: boolean;
  children?: React.ReactNode;
};

export const EditorCommonField: React.FC<EditorCommonFieldProps> = ({
  label,
  inline,
  children,
}) => {
  return (
    <Wrapper inline={inline ? 1 : 0}>
      <EditorCommonLabel>{label}</EditorCommonLabel>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled("div")<{ inline?: number }>(({ inline, theme }) => ({
  width: "100%",
  display: "flex",
  gap: theme.spacing(0.5),
  ...(inline
    ? {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }
    : {
        flexDirection: "column",
      }),
}));

export const EditorCommonLabel = styled("div")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.primary,
}));

export const FieldLineWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  flexWrap: "nowrap",
}));
