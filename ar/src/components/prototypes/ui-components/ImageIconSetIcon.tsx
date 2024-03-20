import { alpha, styled } from "@mui/material";
import { forwardRef, type ComponentPropsWithRef } from "react";

import { type ImageIcon as ImageIconType } from "../datasets";

import { ImageIcon } from "./ImageIcon";

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

export interface ImageIconSetIconProps extends ComponentPropsWithRef<typeof Root> {
  imageIcons: readonly ImageIconType[];
  selected?: boolean;
}

export const ImageIconSetIcon = forwardRef<HTMLDivElement, ImageIconSetIconProps>(
  ({ imageIcons, selected, ...props }, ref) => (
    <Root ref={ref} {...props} selected={selected}>
      <Grid>
        {imageIcons.slice(0, 4).map(({ id, imageUrl, imageColor }) => (
          <ItemWrapper key={id}>
            <ImageIcon imageUrl={imageUrl} imageColor={imageColor} />
          </ItemWrapper>
        ))}
      </Grid>
    </Root>
  ),
);
