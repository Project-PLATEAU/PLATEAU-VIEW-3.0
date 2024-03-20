import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertySelectField,
  PropertyWrapper,
} from "../../../../ui-components";

const pointStyleOptions = [
  {
    label: "Image",
    value: "image",
  },
  {
    label: "Point",
    value: "point",
  },
];

export const EditorPointStyleField: React.FC<BasicFieldProps<"POINT_STYLE_FIELD">> = ({
  component,
  onUpdate,
}) => {
  const handleStyleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value !== "image" && e.target.value !== "point") return;
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          style: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Style">
          <PropertySelectField
            options={pointStyleOptions}
            value={component.preset?.style ?? ""}
            onChange={handleStyleChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};
