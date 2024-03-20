import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertyWrapper,
} from "../../../../ui-components";

export const EditorApplyTimeValueField: React.FC<BasicFieldProps<"APPLY_TIME_VALUE_FIELD">> = ({
  component,
  onUpdate,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!component) return;
      onUpdate?.({
        ...component,
        preset: {
          ...component.preset,
          propertyName: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Time Property">
          <PropertyInputField
            value={component?.preset?.propertyName ?? ""}
            placeholder="Property Name"
            onChange={handleChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};
