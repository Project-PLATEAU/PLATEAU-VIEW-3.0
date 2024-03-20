import { Stack, styled } from "@mui/material";
import { forwardRef, type ReactNode } from "react";

const Root = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(0.5),
}));

export interface InspectorActionsProps {
  children?: ReactNode;
}

export const InspectorActions = forwardRef<HTMLDivElement, InspectorActionsProps>(
  ({ children }, ref) => (
    <Root direction="row" justifyContent="space-evenly" ref={ref}>
      {children}
    </Root>
  ),
);
