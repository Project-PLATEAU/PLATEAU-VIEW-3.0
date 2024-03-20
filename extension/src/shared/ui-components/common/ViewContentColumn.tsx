import { styled } from "@mui/material";
import { FC } from "react";

type ViewContentColumnProps = {
  children?: React.ReactNode;
};

export const ViewContentColumn: FC<ViewContentColumnProps> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));
