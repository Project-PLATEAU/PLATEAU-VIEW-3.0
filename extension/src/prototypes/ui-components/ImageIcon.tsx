import { alpha, styled } from "@mui/material";
import { forwardRef, type ComponentPropsWithRef } from "react";

import useModifiedImage from "./hooks/useModifiedImage";

const Root = styled("div", {
  shouldForwardProp: prop => prop !== "selected",
})<{
  selected?: boolean;
}>(({ theme, selected = false }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  ...(selected && {
    "&:before": {
      content: '""',
      display: "block",
      position: "absolute",
      inset: -8,
      backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
      border: `solid 2px transparent`,
      borderRadius: theme.shape.borderRadius,
      zIndex: -1,
    },
  }),
}));

const Item = styled("div")(() => ({
  overflow: "hidden",
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  width: "100%",
  height: "100%",
  borderRadius: 2,
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
}));

export interface ImageIconProps extends ComponentPropsWithRef<typeof Root> {
  imageUrl: string;
  imageColor?: string;
  selected?: boolean;
}

export const ImageIcon = forwardRef<HTMLDivElement, ImageIconProps>(
  ({ imageUrl, imageColor, selected, ...props }, ref) => {
    const { modifiedImageUrl } = useModifiedImage({
      imageUrl,
      blendColor: imageColor ?? "#FFFFFF",
      width: 16,
      height: 16,
    });

    return (
      <Root ref={ref} {...props} selected={selected}>
        <Item style={{ backgroundImage: `url('${modifiedImageUrl}')` }} />
      </Root>
    );
  },
);
