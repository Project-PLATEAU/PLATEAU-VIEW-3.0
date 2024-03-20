import { styled } from "@mui/material";

export const PropertyWrapper = styled("div")(() => ({
  width: "100%",
  display: "flex",
  alignItems: "stretch",
}));

export const PropertyBox = styled("div")<{ asMenu?: boolean; halfWidth?: boolean }>(
  ({ theme, asMenu, halfWidth }) => ({
    position: "relative",
    width: halfWidth ? "50%" : asMenu ? "120px" : "100%",
    display: "flex",
    padding: theme.spacing(0.5),
    flexDirection: "column",
    flexShrink: asMenu ? 0 : 1,
    flexGrow: asMenu ? 0 : 1,
    gap: theme.spacing(0.5),
    flexWrap: "wrap",
    borderRight: asMenu ? `1px solid ${theme.palette.divider}` : "none",
  }),
);

export const PropertyLineWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
  justifyContent: "space-between",
}));

type PropertyItemProps = {
  label: string;
  children: React.ReactNode;
};
export const PropertyInlineWrapper: React.FC<PropertyItemProps> = ({ label, children }) => {
  return (
    <InlineWrapper>
      <InlineLabel>{label}</InlineLabel>
      <InlineValue>{children}</InlineValue>
    </InlineWrapper>
  );
};

const InlineWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
}));

const InlineLabel = styled("div")(({ theme }) => ({
  width: "120px",
  flex: "0 0 auto",
  padding: theme.spacing(0, 0.5),
}));

const InlineValue = styled("div")(() => ({
  flex: "1 1 auto",
}));

export const PropertyItemWrapper: React.FC<PropertyItemProps> = ({ label, children }) => {
  return (
    <ItemWrapper>
      <Label>{label}</Label>
      <Content>{children}</Content>
    </ItemWrapper>
  );
};

const ItemWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
}));

const Label = styled("div")(({ theme }) => ({
  padding: theme.spacing(0),
}));

const Content = styled("div")(({ theme }) => ({
  padding: theme.spacing(0),
}));
