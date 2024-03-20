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

export const EditorPointSizeField: React.FC<BasicFieldProps<"POINT_SIZE_FIELD">> = ({
  component,
  onUpdate,
}) => {
  const [size, handleSizeChange] = useNumberFieldState(
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
        <PropertyInlineWrapper label="Point Size">
          <PropertyInputField
            placeholder="Value"
            value={size}
            onChange={handleSizeChange}
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
