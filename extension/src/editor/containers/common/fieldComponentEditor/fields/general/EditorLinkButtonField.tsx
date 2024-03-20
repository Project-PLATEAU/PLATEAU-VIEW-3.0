import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertyWrapper,
} from "../../../../ui-components";

export type LinkButtonFieldPreset = {
  title: string;
  url: string;
};

export const EditorLinkButtonField: React.FC<BasicFieldProps<"LINK_BUTTON_FIELD">> = ({
  component,
  onUpdate,
}) => {
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component.preset,
          title: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component.preset,
          url: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Button Title">
          <PropertyInputField
            value={component?.preset?.title ?? ""}
            placeholder="Text"
            onChange={handleTitleChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Link URL">
          <PropertyInputField
            value={component?.preset?.url ?? ""}
            placeholder="https://"
            onChange={handleUrlChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};
