import { styled, useMediaQuery, useTheme } from "@mui/material";
import { blue } from "@mui/material/colors";
import { FC, ReactNode, useMemo } from "react";

import {
  ClockIcon,
  HandIcon,
  MapIcon,
  PedestrianIcon,
  PointerArrowIcon,
  SettingsIcon,
  SketchRectangleIcon,
} from "../../../prototypes/ui-components";

import helpUIOverview from "./assets/help-ui-overview.webp";
import {
  ButtonLegend,
  ContentWrapper,
  ItemWrapper,
  Legend,
  LegendLine,
  LegendText,
  LineWrapper,
  PageTitle,
  Title,
} from "./common";

export const UserInterfacePage: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));

  const items: { id: string; title: string; content?: ReactNode }[] = useMemo(
    () => [
      {
        id: "1",
        title: "ビューア",
      },
      {
        id: "2",
        title: "メニュー",
      },
      {
        id: "3",
        title: "モード",
        content: (
          <LegendLine gap={4} wrap={isMobile}>
            <Legend gap={1} minWidth={70}>
              <ButtonLegend>
                <HandIcon />
              </ButtonLegend>
              <LegendText>移動モード</LegendText>
            </Legend>
            <Legend gap={1} minWidth={70}>
              <ButtonLegend>
                <PointerArrowIcon />
              </ButtonLegend>
              <LegendText>選択モード</LegendText>
            </Legend>
            <Legend gap={1} minWidth={70}>
              <ButtonLegend>
                <PedestrianIcon />
              </ButtonLegend>
              <LegendText>歩行者視点</LegendText>
            </Legend>
            <Legend gap={1} minWidth={70}>
              <ButtonLegend>
                <SketchRectangleIcon />
              </ButtonLegend>
              <LegendText>作図</LegendText>
            </Legend>
          </LegendLine>
        ),
      },
      {
        id: "4",
        title: "ストーリー",
      },
      {
        id: "5",
        title: "設定",
        content: (
          <LegendLine gap={4} wrap={isMobile}>
            <Legend gap={1} minWidth={112}>
              <ButtonLegend>
                <SettingsIcon />
              </ButtonLegend>
              <LegendText>レンダリング設定</LegendText>
            </Legend>
            <Legend gap={1} minWidth={112}>
              <ButtonLegend>
                <ClockIcon />
              </ButtonLegend>
              <LegendText>日時設定</LegendText>
            </Legend>
            <Legend gap={1} minWidth={112}>
              <ButtonLegend>
                <MapIcon />
              </ButtonLegend>
              <LegendText>地図設定</LegendText>
            </Legend>
          </LegendLine>
        ),
      },
      {
        id: "6",
        title: "シェア",
      },
      {
        id: "7",
        title: "検索/データカタログ/レイヤー管理",
      },
      {
        id: "8",
        title: "カメラ所在地/ショートカット",
      },
      {
        id: "9",
        title: "現在地へ飛ぶ",
      },
      {
        id: "10",
        title: "キーボード操作",
      },
      {
        id: "11",
        title: "自動回転",
      },
      {
        id: "12",
        title: "縮小/拡大機能",
      },
      {
        id: "13",
        title: "コンパス：北を指す矢印、クリックするとデフォルト視点に戻る",
      },
    ],
    [isMobile],
  );

  return (
    <ContentWrapper>
      <PageTitle>UIを理解する</PageTitle>
      <img src={helpUIOverview} />
      {items.map(item => (
        <ItemWrapper key={item.id}>
          <LineWrapper>
            <NumberIcon>{item.id}</NumberIcon>
            <Title>{item.title}</Title>
          </LineWrapper>
          {item.content}
        </ItemWrapper>
      ))}
    </ContentWrapper>
  );
};

const NumberIcon = styled("div")(() => ({
  width: 27,
  height: 27,
  borderRadius: 14,
  background: blue[500],
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));
