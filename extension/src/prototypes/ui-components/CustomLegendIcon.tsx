import { alpha, styled } from "@mui/material";
import { forwardRef, type ComponentPropsWithRef, FC, useMemo } from "react";

import { CustomLegend } from "../datasets";

import useModifiedImage from "./hooks/useModifiedImage";

const Root = styled("div", {
  shouldForwardProp: prop => prop !== "selected",
})<{
  selected?: boolean;
}>(({ theme, selected = false }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
  border: "2px solid transparent",
  boxSizing: "border-box",
}));

export interface CustomLegendIconProps extends ComponentPropsWithRef<typeof Root> {
  legend: CustomLegend;
  selected?: boolean;
}

export const CustomLegendIcon = forwardRef<HTMLDivElement, CustomLegendIconProps>(
  ({ legend, selected }, ref) => {
    return (
      <Root ref={ref} selected={selected}>
        <SquareContainer>
          <svg viewBox="0 0 1 1" />
          <Content>
            {legend.type === "icon" && <IconItem legend={legend} />}
            {legend.type === "square" && <SquareItem legend={legend} />}
            {legend.type === "line" && <LineItem legend={legend} />}
            {legend.type === "circle" && <CircleItem legend={legend} />}
          </Content>
        </SquareContainer>
      </Root>
    );
  },
);

const SquareContainer = styled("div")(() => ({
  position: "relative",
  fontSize: 0,
  [`& svg`]: {
    width: "100%",
    height: "100%",
  },
}));

const Content = styled("div")(() => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  left: 0,
  top: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const IconItem: FC<{ legend: CustomLegend }> = ({ legend }) => {
  const { modifiedImageUrl } = useModifiedImage({
    imageUrl: legend.url,
    blendColor: legend.color ?? "#FFFFFF",
    width: 16,
    height: 16,
  });

  const style = useMemo(
    () => ({
      backgroundImage: `url('${modifiedImageUrl}')`,
      border: "none",
    }),
    [modifiedImageUrl],
  );

  return <Item style={style} />;
};

const SquareItem: FC<{ legend: CustomLegend }> = ({ legend }) => {
  const style = useMemo(
    () => ({
      backgroundColor: legend.color,
      borderColor: legend.strokeColor ?? "transparent",
    }),
    [legend.color, legend.strokeColor],
  );

  return <Item style={style} />;
};

const CircleItem: FC<{ legend: CustomLegend }> = ({ legend }) => {
  const style = useMemo(
    () => ({
      backgroundColor: legend.color,
      borderColor: legend.strokeColor ?? "transparent",
      borderRadius: "50%",
    }),
    [legend.color, legend.strokeColor],
  );

  return <Item style={style} />;
};

const LineItem: FC<{ legend: CustomLegend }> = ({ legend }) => {
  const style = useMemo(
    () => ({
      height: "2px",
      backgroundColor: legend.strokeColor,
      border: "none",
    }),
    [legend.strokeColor],
  );

  return <Item style={style} />;
};
