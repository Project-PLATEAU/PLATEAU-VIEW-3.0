import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { styled, useMediaQuery, useTheme } from "@mui/material";
import { FC } from "react";

import {
  HandIcon,
  KeyboardMovementIcon,
  PedestrianIcon,
  PointerArrowIcon,
  SketchRectangleIcon,
} from "../../../prototypes/ui-components";

import {
  ButtonLegend,
  ContentWrapper,
  Legend,
  LegendLine,
  LegendText,
  LineWrapper,
  Title,
  Link,
  ItemWrapper,
} from "./common";
import {
  KeyboardCtrl,
  KeyboardSpace,
  KeyboardWASD,
  MouseLeftLegend,
  MouseMiddleLegend,
  MouseRightLegend,
} from "./legends";

export const ControllersPage: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));

  return (
    <ContentWrapper gap={4.5}>
      <ItemWrapper gap={3}>
        <LineWrapper>
          <ButtonLegend>
            <HandIcon />
          </ButtonLegend>
          <Title>移動モード</Title>
        </LineWrapper>
        <LegendLine gap={6} wrap={isMobile}>
          <Legend gap={3}>
            <IconWrapper width={63}>
              <MouseLeftLegend />
            </IconWrapper>
            <LegendText>トラッグ：画面移動</LegendText>
          </Legend>
          <Legend gap={3}>
            <IconWrapper width={63}>
              <MouseMiddleLegend />
            </IconWrapper>
            <LegendText>トラッグ/回転：拡大縮小</LegendText>
          </Legend>
          <Legend gap={3}>
            <IconWrapper width={63}>
              <MouseRightLegend />
            </IconWrapper>
            <LegendText>トラッグ：視点移動</LegendText>
          </Legend>
        </LegendLine>
      </ItemWrapper>

      <ItemWrapper gap={3}>
        <LineWrapper>
          <ButtonLegend>
            <PointerArrowIcon />
          </ButtonLegend>
          <Title>選択モード</Title>
        </LineWrapper>
        <LegendLine gap={6}>
          <Legend gap={isMobile ? 3 : 6} direction={isMobile ? "column" : "row"}>
            <IconWrapper width={63}>
              <MouseLeftLegend />
            </IconWrapper>
            <LegendTextWrapper>
              <LegendText>クリック：対象建築物を選択</LegendText>
              <LegendText>トラッグ：範囲内建築物を選択</LegendText>
              <LegendText>Space + トラッグ：画面移動</LegendText>
            </LegendTextWrapper>
          </Legend>
        </LegendLine>
      </ItemWrapper>

      <ItemWrapper>
        <LineWrapper>
          <ButtonLegend>
            <PedestrianIcon />
          </ButtonLegend>
          <Title>歩行者視点</Title>
        </LineWrapper>
        <LinkWrapper>
          <Link disabled>
            詳しいを見る <ArrowRightIcon />
          </Link>
        </LinkWrapper>
      </ItemWrapper>

      <ItemWrapper>
        <LineWrapper>
          <ButtonLegend>
            <SketchRectangleIcon />
          </ButtonLegend>
          <Title>作図</Title>
        </LineWrapper>
        <LinkWrapper>
          <Link disabled>
            詳しいを見る <ArrowRightIcon />
          </Link>
        </LinkWrapper>
      </ItemWrapper>

      <ItemWrapper gap={3}>
        <LineWrapper>
          <ButtonLegend>
            <KeyboardMovementIcon />
          </ButtonLegend>
          <Title>キーボード操作</Title>
        </LineWrapper>
        <LegendLine gap={6} wrap={isMobile}>
          <Legend gap={3}>
            <IconWrapper width={124}>
              <KeyboardWASD />
            </IconWrapper>
            <LegendText>WASD：画面移動</LegendText>
          </Legend>
          <Legend gap={3}>
            <IconWrapper width={124}>
              <KeyboardSpace />
            </IconWrapper>
            <LegendText>Space：視点上昇</LegendText>
          </Legend>
          <Legend gap={3} minWidth={124}>
            <IconWrapper width={48}>
              <KeyboardCtrl />
            </IconWrapper>
            <LegendText>Ctrl：視点降下</LegendText>
          </Legend>
        </LegendLine>
      </ItemWrapper>
    </ContentWrapper>
  );
};

const IconWrapper = styled("div")<{ width: number }>(({ width }) => ({
  width,
  [`svg`]: {
    width: "100%",
    height: "100%",
  },
}));

const LegendTextWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: theme.spacing(1.5),
}));

const LinkWrapper = styled("div")(() => ({
  paddingLeft: 48,
}));
