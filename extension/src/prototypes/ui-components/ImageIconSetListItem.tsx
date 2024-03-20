import { IconButton, ListItem, Stack, styled, Typography } from "@mui/material";
import { useAtom, type PrimitiveAtom } from "jotai";
import { type FC } from "react";

import { type ImageIcon as ImageIconType } from "../datasets";

import { ImageIcon } from "./ImageIcon";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  // Increase specificity
  "&&": {
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(-1),
    marginLeft: theme.spacing(-1),
    pointerEvents: "none",
  },
}));

const IconWrapper = styled("div")(() => ({
  position: "relative",
  width: 16,
  height: 16,
}));

export interface ImageIconSetListItemProps {
  imageIconAtom: PrimitiveAtom<ImageIconType>;
  onChange?: () => void;
}

export const ImageIconSetListItem: FC<ImageIconSetListItemProps> = ({ imageIconAtom }) => {
  const [imageIcon] = useAtom(imageIconAtom);

  return (
    <ListItem disableGutters>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <StyledIconButton>
          <IconWrapper>
            <ImageIcon imageUrl={imageIcon.imageUrl} imageColor={imageIcon.imageColor} />
          </IconWrapper>
        </StyledIconButton>
        <Typography variant="body2">{imageIcon.name}</Typography>
      </Stack>
    </ListItem>
  );
};
