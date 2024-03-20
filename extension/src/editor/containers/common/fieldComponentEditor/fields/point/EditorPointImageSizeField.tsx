import { InputAdornment } from "@mui/material";
import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertySwitch,
  PropertyWrapper,
} from "../../../../ui-components";
import { useNumberFieldState } from "../../hooksUtils";

export const EditorPointImageSizeField: React.FC<BasicFieldProps<"POINT_IMAGE_SIZE_FIELD">> = ({
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

  const handleEnableSizeInMetersChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          enableSizeInMeters: !!e.target.checked,
        },
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertySwitch
          label="Enable SizeInMeters"
          checked={!!component.preset?.enableSizeInMeters}
          onChange={handleEnableSizeInMetersChange}
        />
        <PropertyInlineWrapper label="Image Size">
          <PropertyInputField
            placeholder="Value"
            value={size}
            onChange={handleSizeChange}
            type="number"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {component.preset?.enableSizeInMeters ? "meter" : "scale"}
                </InputAdornment>
              ),
            }}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};
