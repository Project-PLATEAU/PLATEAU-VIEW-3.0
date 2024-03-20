import { styled } from "@mui/material";
import { type FC } from "react";

import {
  FloatingPanel,
  ParameterList,
  SliderParameterItem,
} from "../../ui-components";

import { fovPiOverAtom } from "../states/ar";

const Root = styled(FloatingPanel)(({ theme }) => ({
  width: 360,
  padding: theme.spacing(1),
}));

const Title = styled("div")(({ theme }) => ({
  ...theme.typography.h5,
  margin: theme.spacing(1),
}));

export const FovPanel: FC = () => {
  return (
    <Root>
      <Title>視野角設定</Title>
      <ParameterList>
        <SliderParameterItem
          label="PI over X"
          description="視野角を微調整します。π/xのxを調整してください。"
          min={1}
          max={10}
          step={0.1}
          atom={fovPiOverAtom}
        />
      </ParameterList>
    </Root>
  );
};
