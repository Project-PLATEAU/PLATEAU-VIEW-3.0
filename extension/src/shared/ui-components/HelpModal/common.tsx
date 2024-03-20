import { styled } from "@mui/material";
import { blue } from "@mui/material/colors";
import { FC, ReactNode } from "react";

import { PointHand } from "./legends/PointHand";

export const ContentWrapper = styled("div")<{ gap?: number }>(({ gap = 2.5, theme }) => ({
  width: "100%",
  padding: theme.spacing(2.5, 2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(gap),
  fontSize: theme.typography.h6.fontSize,
}));

export const ItemWrapper = styled("div")<{ gap?: number }>(({ gap = 1.5, theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(gap),
}));

export const PageTitle = styled("div")(({ theme }) => ({
  ...theme.typography.h5,
}));

export const SubTitle = styled("div")(({ theme }) => ({
  ...theme.typography.h6,
}));

export const SecondaryTitle = styled("div")(({ theme }) => ({
  ...theme.typography.h6,
  color: theme.palette.text.secondary,
}));

export const LineWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: theme.spacing(1.5),
}));

export const ButtonLegend = styled("div")(({ theme }) => ({
  width: 36,
  height: 30,
  borderRadius: 4,
  background: theme.palette.primary.main,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const Title = styled("div")(({ theme }) => ({
  fontSize: theme.typography.h6.fontSize,
  fontWeight: theme.typography.h6.fontWeight,
}));

export const Legend = styled("div")<{
  direction?: "row" | "column";
  gap?: number;
  minWidth?: number;
}>(({ direction = "column", gap = 1, minWidth = 0, theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: direction,
  gap: theme.spacing(gap),
  minWidth,
}));

export const LegendText = styled("div")(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  color: theme.palette.text.secondary,
}));

export const LegendLine = styled("div", {
  shouldForwardProp: prop => prop !== "wrap",
})<{ gap?: number; wrap?: boolean }>(({ gap = 1, wrap, theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  gap: theme.spacing(gap),
  flexWrap: wrap ? "wrap" : "nowrap",
}));

export const Link = styled("a")<{ disabled?: boolean }>(({ disabled, theme }) => ({
  color: disabled ? theme.palette.text.disabled : blue[500],
  fontSize: theme.typography.body1.fontSize,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-start",
}));

type GraphicItemProps = {
  title: string;
  children: ReactNode;
  verticalPadding?: number;
  horizontalPadding?: number;
  gap?: number;
  direction?: "row" | "column";
};
export const GraphicItem: FC<GraphicItemProps> = ({
  title,
  verticalPadding,
  horizontalPadding,
  gap,
  direction,
  children,
}) => {
  return (
    <GraphicItemWrapper>
      <Graphics
        verticalPadding={verticalPadding}
        horizontalPadding={horizontalPadding}
        gap={gap}
        direction={direction}>
        {children}
      </Graphics>
      <GraphicTitle>{title}</GraphicTitle>
    </GraphicItemWrapper>
  );
};

const GraphicItemWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(0.5),
}));

const Graphics = styled("div")<{
  gap?: number;
  direction?: "row" | "column";
  verticalPadding?: number;
  horizontalPadding?: number;
}>(({ gap = 1.5, direction = "row", verticalPadding = 2.5, horizontalPadding = 2, theme }) => ({
  width: "100%",
  padding: theme.spacing(verticalPadding, horizontalPadding),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(gap),
  flexDirection: direction,
  background: theme.palette.grey[50],
}));

const GraphicTitle = styled("div")(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
}));

type GraphicProps = {
  img: string;
  width: number;
  handTop?: number;
  handLeft?: number;
  zIndex?: number;
};
export const Graphic: FC<GraphicProps> = ({ img, width, handTop, handLeft, zIndex }) => {
  return (
    <GraphicWrapper width={width} zIndex={zIndex}>
      <img src={img} />
      {handTop !== undefined && handLeft !== undefined && (
        <StyledPointHand left={handLeft} top={handTop} />
      )}
    </GraphicWrapper>
  );
};

const GraphicWrapper = styled("div")<{ width: number; zIndex?: number }>(({ width, zIndex }) => ({
  position: "relative",
  width,
  fontSize: 0,
  ...(zIndex !== undefined ? { zIndex } : undefined),
  [`img`]: {
    width: "100%",
  },
}));

const StyledPointHand = styled(PointHand)<{ left: number; top: number }>(({ left, top }) => ({
  position: "absolute",
  left: `${left}%`,
  marginTop: `${top}%`,
}));
