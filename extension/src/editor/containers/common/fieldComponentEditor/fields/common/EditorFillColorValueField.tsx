import { useMemo, useCallback, ReactElement } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyCard,
  PropertyInputField,
  PropertySwitch,
  PropertyWrapper,
  PropertyColorField,
} from "../../../../ui-components";

type SupportedFieldTypes = "POINT_FILL_COLOR_VALUE_FIELD" | "POLYLINE_FILL_COLOR_VALUE_FIELD";

export type FillColorValueFieldPreset = {
  defaultValue?: string;
  asLegend?: boolean;
  legendName?: string;
};

export const EditorFillColorValueField = ({
  component,
  onUpdate,
}: BasicFieldProps<SupportedFieldTypes>): ReactElement | null => {
  const preset = useMemo(() => {
    return component?.preset ?? {};
  }, [component]);

  const handleRuleUpdate = useCallback(
    (preset: FillColorValueFieldPreset) => {
      onUpdate?.({
        ...component,
        preset,
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyCard
          id={""}
          noMove
          noRemove
          mainPanel={<RuleMainPanel preset={preset} onRuleUpdate={handleRuleUpdate} />}
          legendPanel={<RuleLegendPanel preset={preset} onRuleUpdate={handleRuleUpdate} />}
        />
      </PropertyBox>
    </PropertyWrapper>
  );
};

type RulePanelProps = {
  preset: FillColorValueFieldPreset;
  onRuleUpdate: (preset: FillColorValueFieldPreset) => void;
};

const RuleMainPanel: React.FC<RulePanelProps> = ({ preset, onRuleUpdate }) => {
  const handleColorChange = useCallback(
    (color: string) => {
      onRuleUpdate({
        ...preset,
        defaultValue: color,
      });
    },
    [preset, onRuleUpdate],
  );

  return <PropertyColorField value={preset.defaultValue} onChange={handleColorChange} />;
};

const RuleLegendPanel: React.FC<RulePanelProps> = ({ preset, onRuleUpdate }) => {
  const handleLegendNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onRuleUpdate({ ...preset, legendName: e.target.value });
    },
    [preset, onRuleUpdate],
  );

  const handleAsLegendChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onRuleUpdate({
        ...preset,
        asLegend: e.target.checked,
      });
    },
    [preset, onRuleUpdate],
  );

  return (
    <>
      <PropertySwitch
        label="As Legend"
        checked={!!preset.asLegend}
        onChange={handleAsLegendChange}
      />
      <PropertyInputField
        placeholder="Display Title"
        value={preset.legendName ?? ""}
        onChange={handleLegendNameChange}
      />
    </>
  );
};
