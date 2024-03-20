import { ChangeEvent, useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertySelectField,
  PropertyWrapper,
} from "../../../../ui-components";

export type ClassificationTypeFieldPreset = {
  defaultValue: "both" | "3dtiles" | "terrain";
};

const OPTIONS = [
  {
    label: "BOTH",
    value: "both",
  },
  {
    label: "CESIUM_3D_TILE",
    value: "3dtiles",
  },
  {
    label: "TERRAIN",
    value: "terrain",
  },
];

type SupportedFieldTypes =
  | "POLYLINE_CLASSIFICATION_TYPE_FIELD"
  | "POLYGON_CLASSIFICATION_TYPE_FIELD";

export const EditorCLassificationTypeField: React.FC<BasicFieldProps<SupportedFieldTypes>> = ({
  component,
  onUpdate,
}) => {
  const handleValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          defaultValue: e.target.value as ClassificationTypeFieldPreset["defaultValue"],
        },
      });
    },
    [component, onUpdate],
  );
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Classfication Type">
          <PropertySelectField
            options={OPTIONS}
            value={component.preset?.defaultValue || "both"}
            onChange={handleValueChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};
