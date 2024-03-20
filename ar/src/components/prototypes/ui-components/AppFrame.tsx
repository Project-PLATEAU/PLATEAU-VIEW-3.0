import { styled } from "@mui/material";
import { type FC, type ReactNode } from "react";

const Root = styled("div")({
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

const Header = styled("div")({
  flexGrow: 0,
  flexShrink: 0,
});

const Body = styled("div")({
  position: "relative",
  flexGrow: 0,
  flexShrink: 0,
});

export interface AppFrameProps {
  header?: ReactNode;
  children?: ReactNode;
}

export const AppFrame: FC<AppFrameProps> = ({ header, children }) => (
  <Root>
    {header && <Header>{header}</Header>}
    {children && <Body>{children}</Body>}
  </Root>
);
