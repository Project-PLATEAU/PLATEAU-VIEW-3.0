import { alpha, styled } from "@mui/material";
import { forwardRef, type ComponentPropsWithRef } from "react";

import { CustomLegend } from "../datasets";

import { CustomLegendIcon } from "./CustomLegendIcon";

const Root = styled("div", {
  shouldForwardProp: prop => prop !== "selected",
})<{
  selected?: boolean;
}>(({ theme, selected = false }) => ({
  position: "relative",
  ...(selected && {
    "&:before": {
      content: '""',
      display: "block",
      position: "absolute",
      inset: -8,
      backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
      border: `solid 2px ${theme.palette.primary.main}`,
      borderRadius: theme.shape.borderRadius,
      zIndex: -1,
    },
  }),
}));

const Grid = styled("div")({
  overflow: "hidden",
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  width: 16,
  height: 16,
  borderRadius: 2,
});

const ItemWrapper = styled("div")({
  position: "relative",
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "50%",
  display: "flex",
});

export interface CustomLegendSetIconProps extends ComponentPropsWithRef<typeof Root> {
  customLegends: readonly CustomLegend[];
  selected?: boolean;
}

export const CustomLegendSetIcon = forwardRef<HTMLDivElement, CustomLegendSetIconProps>(
  ({ customLegends, selected }, ref) => (
    <Root ref={ref} selected={selected}>
      <Grid>
        {customLegends.slice(0, 4).map((legend, index) => (
          <ItemWrapper key={index}>
            <CustomLegendIcon legend={legend} />
          </ItemWrapper>
        ))}
      </Grid>
    </Root>
  ),
);
