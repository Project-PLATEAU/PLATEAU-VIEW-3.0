import { InputAdornment } from "@mui/material";
import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertyWrapper,
} from "../../../../ui-components";
import { useNumberFieldState } from "../../hooksUtils";

export const EditorPolygonStrokeWeightField: React.FC<
  BasicFieldProps<"POLYGON_STROKE_WEIGHT_FIELD">
> = ({ component, onUpdate }) => {
  const [value, handleChangeValue] = useNumberFieldState(
    component.preset?.defaultValue,
    useCallback(
      v => {
        onUpdate({
          ...component,
          preset: {
            ...component.preset,
            defaultValue: v,
          },
        });
      },
      [component, onUpdate],
    ),
  );
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Stroke Weight">
          <PropertyInputField
            placeholder="Value"
            value={value}
            onChange={handleChangeValue}
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};
