import { Paper, styled, type PaperProps, useTheme, useMediaQuery } from "@mui/material";
import {
  Resizable,
  ResizableProps,
  type ResizeCallback,
  type ResizeStartCallback,
} from "re-resizable";
import { forwardRef } from "react";

import { AutoHeight } from "./AutoHeight";
import { Scrollable } from "./Scrollable";

const StyledPaper = styled(Paper, {
  shouldForwardProp: props => props !== "maxWidth",
})(({ theme, elevation = 4 }) => ({
  position: "relative",
  maxHeight: "100%",
  boxShadow: theme.shadows[elevation],
  pointerEvents: "auto",
}));

const ResizableRoot = styled("div")({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  maxHeight: "100%",
  "&&": {
    height: "auto !important",
  },
});

const ScrollableRoundedBox = styled(Scrollable)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}));

export interface InspectorProps
  extends Omit<PaperProps, "onResize">,
    Pick<ResizableProps, "maxWidth" | "onResize" | "onResizeStart" | "onResizeStop"> {
  defaultWidth?: number;
  scrollable?: boolean;
  onResize?: ResizeCallback;
  onResizeStart?: ResizeStartCallback;
  onResizeStop?: ResizeCallback;
}

export const Inspector = forwardRef<HTMLDivElement, InspectorProps>(
  (
    {
      defaultWidth = 360,
      onResize,
      onResizeStart,
      onResizeStop,
      children,
      scrollable = true,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));
    return (
      <AutoHeight>
        <StyledPaper ref={ref} {...props}>
          {isMobile ? (
            <ScrollableRoundedBox defer sx={{ width: `calc(100vw - ${theme.spacing(2)})` }}>
              {children}
            </ScrollableRoundedBox>
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
              {scrollable ? (
                <ScrollableRoundedBox defer>{children}</ScrollableRoundedBox>
              ) : (
                children
              )}
            </Resizable>
          )}
        </StyledPaper>
      </AutoHeight>
    );
  },
);
