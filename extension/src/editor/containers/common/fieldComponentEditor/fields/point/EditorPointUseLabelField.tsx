import { InputAdornment } from "@mui/material";
import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyColorField,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertySwitchField,
  PropertyWrapper,
} from "../../../../ui-components";
import { useNumberFieldState } from "../../hooksUtils";

export type PointUseLabelFieldPreset = {
  textExpression?: string;
  fontSize?: number;
  fontColor?: string;
  height?: number;
  extruded?: boolean;
  background?: boolean;
  backgroundColor?: string;
};

export const EditorPointUseLabelField: React.FC<BasicFieldProps<"POINT_USE_LABEL_FIELD">> = ({
  component,
  onUpdate,
}) => {
  const handleTextExpressionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          textExpression: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  const [fontSize, handleFontSizeChange] = useNumberFieldState(
    component.preset?.fontSize,
    useCallback(
      v => {
        onUpdate({
          ...component,
          preset: {
            ...component.preset,
            fontSize: v,
          },
        });
      },
      [component, onUpdate],
    ),
  );

  const handleFontColorChange = useCallback(
    (fontColor: string) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          fontColor,
        },
      });
    },
    [component, onUpdate],
  );

  const [height, handleHeightChange] = useNumberFieldState(
    component.preset?.height,
    useCallback(
      v => {
        onUpdate({
          ...component,
          preset: {
            ...component.preset,
            height: v,
          },
        });
      },
      [component, onUpdate],
    ),
  );

  const handleExtrudedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          extruded: !!e.target.checked,
        },
      });
    },
    [component, onUpdate],
  );

  const handleBackgroundChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          background: !!e.target.checked,
        },
      });
    },
    [component, onUpdate],
  );

  const handleBackgroundColorChange = useCallback(
    (backgroundColor: string) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          backgroundColor,
        },
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Text Expression">
          <PropertyInputField
            placeholder="Expression"
            value={component.preset?.textExpression ?? ""}
            onChange={handleTextExpressionChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Font Size">
          <PropertyInputField
            value={fontSize}
            onChange={handleFontSizeChange}
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Font Color">
          <PropertyColorField
            value={component.preset?.fontColor}
            onChange={handleFontColorChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Background">
          <PropertySwitchField
            checked={!!component.preset?.background}
            onChange={handleBackgroundChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Background Color">
          <PropertyColorField
            value={component.preset?.backgroundColor}
            onChange={handleBackgroundColorChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Point Height">
          <PropertyInputField
            value={height}
            onChange={handleHeightChange}
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">meter</InputAdornment>,
            }}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Point Extruded">
          <PropertySwitchField
            checked={!!component.preset?.extruded}
            onChange={handleExtrudedChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};
