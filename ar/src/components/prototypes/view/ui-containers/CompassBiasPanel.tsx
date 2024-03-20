import { styled } from "@mui/material";
import { type FC } from "react";

import {
  FloatingPanel,
  ParameterList,
  SliderParameterItem,
} from "../../ui-components";

import { compassBiasAtom } from "../states/ar";

const Root = styled(FloatingPanel)(({ theme }) => ({
  width: 360,
  padding: theme.spacing(1),
}));

const Title = styled("div")(({ theme }) => ({
  ...theme.typography.h5,
  margin: theme.spacing(1),
}));

export const CompassBiasPanel: FC = () => {
  return (
    <Root>
      <Title>コンパス設定</Title>
      <ParameterList>
        <SliderParameterItem
          label="コンパスバイアス"
          description="方位を微調整します。注目オブジェクトを選択してから使用してください。"
          min={-180}
          max={180}
          step={1}
          atom={compassBiasAtom}
        />
      </ParameterList>
    </Root>
  );
};
