import { IconButton, ListItem, Stack, styled, Typography } from "@mui/material";
import { useAtom, type PrimitiveAtom } from "jotai";
import { type FC } from "react";

import { CustomLegend } from "../datasets";

import { CustomLegendIcon } from "./CustomLegendIcon";

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

export interface CustomLegendIconSetListItemProps {
  customLegendAtom: PrimitiveAtom<CustomLegend>;
  onChange?: () => void;
}

export const CustomLegendIconSetListItem: FC<CustomLegendIconSetListItemProps> = ({
  customLegendAtom,
}) => {
  const [customLegend] = useAtom(customLegendAtom);

  return (
    <ListItem disableGutters>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <StyledIconButton>
          <IconWrapper>
            <CustomLegendIcon legend={customLegend} />
          </IconWrapper>
        </StyledIconButton>
        <Typography variant="body2">{customLegend.title}</Typography>
      </Stack>
    </ListItem>
  );
};
