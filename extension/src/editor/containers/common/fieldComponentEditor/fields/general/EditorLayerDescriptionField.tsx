import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyTextareaField,
  PropertyWrapper,
} from "../../../../ui-components/property";

export const EditorLayerDescriptionField: React.FC<BasicFieldProps<"LAYER_DESCRIPTION_FIELD">> = ({
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
          description: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyTextareaField value={component?.preset?.description} onChange={handleChange} />
      </PropertyBox>
    </PropertyWrapper>
  );
};
