import { styled } from "@mui/material";
import { type FC } from "react";

import { shareableGraphicsQualityAtom } from "../../../shared/states/scene";
import {
  FloatingPanel,
  ParameterList,
  SegmentParameterItem,
  SwitchParameterItem,
} from "../../ui-components";
import { nativeResolutionEnabledAtom } from "../states/graphics";

const Root = styled(FloatingPanel)(({ theme }) => ({
  width: 360,
  padding: theme.spacing(1),
  [theme.breakpoints.down("mobile")]: {
    boxSizing: "border-box",
    width: `calc(100vw - ${theme.spacing(2)})`,
  },
}));

const Title = styled("div")(({ theme }) => ({
  ...theme.typography.h5,
  margin: theme.spacing(1),
}));

export const SettingsPanel: FC = () => {
  return (
    <Root>
      <Title>設定</Title>
      <ParameterList>
        <SegmentParameterItem
          label="グラフィック品質"
          exclusive
          atom={shareableGraphicsQualityAtom}
          items={[
            ["low", "低"],
            ["medium", "中"],
            ["high", "高"],
            ["ultra", "最高"],
          ]}
        />
        {window.devicePixelRatio > 1 && (
          <SwitchParameterItem
            label="ネイティブ解像度"
            description="画面の精細さが向上しますが、デバイスの性能によっては、レスポンスが低下することがあります"
            atom={nativeResolutionEnabledAtom}
          />
        )}
      </ParameterList>
    </Root>
  );
};
