import { useCallback, useEffect, useState } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertyWrapper,
} from "../../../../ui-components";

export type OpacityFieldPreset = {
  defaultValue?: number;
};

export const EditorOpacityField: React.FC<BasicFieldProps<"OPACITY_FIELD">> = ({
  component,
  onUpdate,
}) => {
  const [localValue, setLocalValue] = useState(component.preset?.defaultValue ?? "1");

  const handleLocalValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  useEffect(() => {
    const numberValue = Number(localValue);
    if (
      isNaN(numberValue) ||
      numberValue > 1 ||
      numberValue < 0 ||
      numberValue === component.preset?.defaultValue
    )
      return;

    onUpdate?.({
      ...component,
      preset: {
        ...component.preset,
        defaultValue: numberValue,
      },
    });
  }, [localValue, component, onUpdate]);

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Default Opacity">
          <PropertyInputField
            value={localValue}
            placeholder="0 ~ 1"
            onChange={handleLocalValueChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};
