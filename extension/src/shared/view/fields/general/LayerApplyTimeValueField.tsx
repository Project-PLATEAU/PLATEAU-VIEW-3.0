import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { useAtom } from "jotai";
import { type FC, useCallback } from "react";
import styled from "styled-components";

import { ParameterList } from "../../../../prototypes/ui-components";
import { ApplyTimeValueField } from "../../../types/fieldComponents/general";
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

export interface LayerApplyTimeValueFieldProps {
  atoms: WritableAtomForComponent<ApplyTimeValueField>[];
}

export const LayerApplyTimeValueField: FC<LayerApplyTimeValueFieldProps> = ({ atoms }) => {
  const [component, setComponent] = useAtom(atoms[0]);

  const handleTimeBasedDisplayChange = useCallback(
    (_event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
      setComponent({
        ...component,
        value: {
          ...component.value,
          timeBasedDisplay: checked,
        },
      });
    },
    [component, setComponent],
  );

  return (
    <ParameterList>
      <StyledFormGroup>
        <SwitchFormControlLabel
          checked={component.value?.timeBasedDisplay}
          labelPlacement="start"
          control={<Switch size="small" />}
          label={"Time Based Display"}
          onChange={handleTimeBasedDisplayChange}
        />
      </StyledFormGroup>
    </ParameterList>
  );
};
