import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { useAtom } from "jotai";
import { type FC, useCallback } from "react";
import styled from "styled-components";

import { ParameterList } from "../../../../prototypes/ui-components";
import { TilesetWireframeField } from "../../../types/fieldComponents/3dtiles";
import { LayerModel } from "../../../view-layers";
import { WritableAtomForComponent } from "../../../view-layers/component";

const StyledFormGroup = styled(FormGroup)`
  padding: 4px 8px;
`;

const SwitchFormControlLabel = styled(FormControlLabel)`
  justify-content: end;
  & > .MuiFormControlLabel-label {
    flex: 1;
    margin-left: 0;
  }
`;

export interface LayerWireframeFieldProps {
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<TilesetWireframeField>[];
}

export const LayerTilesetWireframeField: FC<LayerWireframeFieldProps> = ({ atoms }) => {
  const [component, setComponent] = useAtom(atoms[0]);

  const handleWireframeDisplayChange = useCallback(
    (_event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
      setComponent({
        ...component,
        value: {
          ...component.value,
          wireframe: checked,
        },
      });
    },
    [component, setComponent],
  );

  return (
    <ParameterList>
      <StyledFormGroup>
        <SwitchFormControlLabel
          checked={component.value?.wireframe}
          labelPlacement="start"
          control={<Switch size="small" />}
          label={"ワイヤーフレーム表示"}
          onChange={handleWireframeDisplayChange}
        />
      </StyledFormGroup>
    </ParameterList>
  );
};
