import { Stack, styled, Tooltip } from "@mui/material";
import { type ComponentPropsWithoutRef, type FC } from "react";

import { CustomLegend } from "../datasets";

import { CustomLegendIcon } from "./CustomLegendIcon";

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

export interface CustomLegendIconLegendProps extends ComponentPropsWithoutRef<typeof Root> {
  customLegends: readonly CustomLegend[];
}

export const CustomLegendIconLegend: FC<CustomLegendIconLegendProps> = ({ customLegends }) => {
  return (
    <Root>
      <Stack direction="row" margin={-0.5} useFlexGap flexWrap="wrap">
        {customLegends.map((legend, index) => (
          <Tooltip key={index} title={legend.title} enterDelay={0} leaveDelay={0}>
            <Cell>
              <IconWrapper>
                <CustomLegendIcon legend={legend} />
              </IconWrapper>
            </Cell>
          </Tooltip>
        ))}
      </Stack>
    </Root>
  );
};
