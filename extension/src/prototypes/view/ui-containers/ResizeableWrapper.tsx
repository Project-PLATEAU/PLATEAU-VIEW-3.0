import { styled, useTheme, useMediaQuery } from "@mui/material";
import { Resizable, ResizableProps } from "re-resizable";
import { FC, ReactNode } from "react";

const ResizableRoot = styled("div")({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  maxHeight: "100%",
  pointerEvents: "all",
  "&&": {
    height: "auto !important",
  },
});

export interface ResizeableWrapperProps extends ResizableProps {
  defaultWidth?: number;
  children?: ReactNode;
}

export const ResizeableWrapper: FC<ResizeableWrapperProps> = ({
  children,
  defaultWidth = 360,
  onResize,
  onResizeStart,
  onResizeStop,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));

  return isMobile ? (
    <>{children}</>
  ) : (
    <Resizable
      as={ResizableRoot}
      defaultSize={{
        width: defaultWidth,
        height: "auto",
      }}
      minWidth={320}
      enable={{
        left: true,
        right: true,
      }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}>
      {children}
    </Resizable>
  );
};
