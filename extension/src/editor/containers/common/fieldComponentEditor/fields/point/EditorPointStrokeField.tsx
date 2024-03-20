import { InputAdornment } from "@mui/material";
import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyColorField,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertyWrapper,
} from "../../../../ui-components";
import { useNumberFieldState } from "../../hooksUtils";

export const EditorPointStrokeField: React.FC<BasicFieldProps<"POINT_STROKE_FIELD">> = ({
  component,
  onUpdate,
}) => {
  const handleColorChange = useCallback(
    (color: string) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          color,
        },
      });
    },
    [component, onUpdate],
  );

  const [size, handleSizeChange] = useNumberFieldState(
    component.preset?.width,
    useCallback(
      v => {
        onUpdate({
          ...component,
          preset: {
            ...component.preset,
            width: v,
          },
        });
      },
      [component, onUpdate],
    ),
  );
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Stroke color">
          <PropertyColorField value={component.preset?.color} onChange={handleColorChange} />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Stroke width">
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
