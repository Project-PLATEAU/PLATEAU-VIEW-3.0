import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  styled,
} from "@mui/material";
import { useAtom } from "jotai";
import { type FC, useCallback } from "react";

import {
  GroupedParameterItem,
  InspectorItem,
  ParameterList,
} from "../../../../prototypes/ui-components";
import { TilesetClippingField } from "../../../types/fieldComponents/3dtiles";
import { LayerModel } from "../../../view-layers";
import { WritableAtomForComponent } from "../../../view-layers/component";

const SwitchFormControlLabel = styled(FormControlLabel)`
  justify-content: end;
  & > .MuiFormControlLabel-label {
    flex: 1;
    margin-left: 0;
  }
`;

export interface LayerTilesetClippingFieldProps {
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<TilesetClippingField>[];
}

export const LayerTilesetClippingField: FC<LayerTilesetClippingFieldProps> = ({ atoms }) => {
  const [component, setComponent] = useAtom(atoms[0]);

  const value = component.value;
  const { enable, visible, allowEnterGround, direction } = value;

  const handleChangeEnable = useCallback(
    (_event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
      setComponent({
        ...component,
        value: {
          ...value,
          enable: checked,
        },
      });
    },
    [component, setComponent, value],
  );
  const handleChangeVisible = useCallback(
    (_event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
      setComponent({ ...component, value: { ...value, visible: checked } });
    },
    [component, setComponent, value],
  );
  const handleChangeAllowEnterGround = useCallback(
    (_event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
      setComponent({ ...component, value: { ...value, allowEnterGround: !checked } });
    },
    [component, setComponent, value],
  );
  const handleChangeDirection = useCallback(
    (event: SelectChangeEvent<string>) => {
      setComponent({
        ...component,
        value: { ...value, direction: event.target.value as "inside" | "outside" },
      });
    },
    [component, setComponent, value],
  );

  return (
    <GroupedParameterItem label="クリッピング">
      <InspectorItem sx={{ width: 320 }}>
        <ParameterList>
          <FormGroup>
            <SwitchFormControlLabel
              checked={enable}
              labelPlacement="start"
              control={<Switch size="small" />}
              label={"クリッピング"}
              onChange={handleChangeEnable}
            />
            <FormControlLabel
              disabled={!enable}
              checked={visible}
              control={<Checkbox size="small" />}
              label={"クリップボックスを表示"}
              onChange={handleChangeVisible}
            />
            <FormControlLabel
              disabled={!enable}
              checked={!allowEnterGround}
              control={<Checkbox size="small" />}
              label={"クリップボックスを地面にスナップ"}
              onChange={handleChangeAllowEnterGround}
            />
            <Select<string>
              value={direction}
              disabled={!enable}
              size="small"
              onChange={handleChangeDirection}>
              <MenuItem value="inside">ボックス内</MenuItem>
              <MenuItem value="outside">ボックス外</MenuItem>
            </Select>
          </FormGroup>
        </ParameterList>
      </InspectorItem>
    </GroupedParameterItem>
  );
};
