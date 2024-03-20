import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertyWrapper,
} from "../../../../ui-components";

export type PointConvertFromCSVFieldPreset = {
  lngColumn?: string;
  latColumn?: string;
  heightColumn?: string;
};

export const EditorPointConvertFromCSVField: React.FC<
  BasicFieldProps<"POINT_CONVERT_FROM_CSV">
> = ({ component, onUpdate }) => {
  const handleLngColumnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          lngColumn: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  const handleLatColumnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          latColumn: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  const handleHeightColumnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          heightColumn: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Longitude Field">
          <PropertyInputField
            value={component.preset?.lngColumn}
            placeholder="Column Name"
            onChange={handleLngColumnChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Latitude Field">
          <PropertyInputField
            value={component.preset?.latColumn}
            placeholder="Column Name"
            onChange={handleLatColumnChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Height Field">
          <PropertyInputField
            value={component.preset?.heightColumn}
            placeholder="Column Name"
            onChange={handleHeightColumnChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};
