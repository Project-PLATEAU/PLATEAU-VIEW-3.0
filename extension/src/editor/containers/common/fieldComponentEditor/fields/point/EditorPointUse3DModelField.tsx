import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertyWrapper,
} from "../../../../ui-components";
import { useNumberFieldState } from "../../hooksUtils";

export const EditorPointUse3DModelField: React.FC<BasicFieldProps<"POINT_USE_3D_MODEL">> = ({
  component,
  onUpdate,
}) => {
  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          url: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  const [size, handleSizeChange] = useNumberFieldState(
    component.preset?.size,
    useCallback(
      v => {
        onUpdate({
          ...component,
          preset: {
            ...component.preset,
            size: v,
          },
        });
      },
      [component, onUpdate],
    ),
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Model URL">
          <PropertyInputField
            placeholder="Value"
            value={component.preset?.url ?? ""}
            onChange={handleUrlChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Size">
          <PropertyInputField
            placeholder="Value"
            value={size}
            onChange={handleSizeChange}
            type="number"
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};
