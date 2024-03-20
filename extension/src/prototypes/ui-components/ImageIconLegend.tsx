import { Stack, styled, Tooltip } from "@mui/material";
import { type ComponentPropsWithoutRef, type FC } from "react";

import { type ImageIcon as ImageIconType } from "../datasets";

import { ImageIcon } from "./ImageIcon";

const Root = styled("div")({
  overflow: "hidden",
});

const Cell = styled("div")(({ theme }) => ({
  padding: theme.spacing(0.5),
}));

const IconWrapper = styled("div")(() => ({
  position: "relative",
  width: 16,
  height: 16,
}));

export interface ImageIconLegendProps extends ComponentPropsWithoutRef<typeof Root> {
  imageIcons: readonly ImageIconType[];
}

export const ImageIconLegend: FC<ImageIconLegendProps> = ({ imageIcons, ...props }) => {
  return (
    <Root {...props}>
      <Stack direction="row" margin={-0.5} useFlexGap flexWrap="wrap">
        {imageIcons.map(imageIcon => (
          <Tooltip key={imageIcon.id} title={imageIcon.name} enterDelay={0} leaveDelay={0}>
            <Cell>
              <IconWrapper>
                <ImageIcon imageUrl={imageIcon.imageUrl} imageColor={imageIcon.imageColor} />
              </IconWrapper>
            </Cell>
          </Tooltip>
        ))}
      </Stack>
    </Root>
  );
};
