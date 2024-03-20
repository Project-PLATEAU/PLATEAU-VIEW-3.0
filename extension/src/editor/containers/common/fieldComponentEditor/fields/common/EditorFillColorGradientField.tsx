import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { Select, SelectChangeEvent, styled } from "@mui/material";
import { useState, useMemo, useCallback, useEffect, ReactElement } from "react";

import { BasicFieldProps } from "..";
import { ParameterItem, SelectItem } from "../../../../../../prototypes/ui-components";
import { ColorMapSelectItemContent } from "../../../../../../prototypes/ui-components/ColorMapSelectItemContent";
import { SettingComponent } from "../../../../../../shared/api/types";
import { COLOR_MAPS } from "../../../../../../shared/constants";
import { generateID } from "../../../../../../shared/utils/id";
import {
  PropertyBox,
  PropertyButton,
  PropertyCard,
  PropertyInputField,
  PropertyLineWrapper,
  PropertySwitch,
  PropertyWrapper,
} from "../../../../ui-components";
import { useNumberFieldState } from "../../hooksUtils";

export type FillColorGradientFieldPresetRule = {
  id: string;
  propertyName?: string;
  legendName?: string;
  max?: number;
  min?: number;
  colorMapName?: string;
  asDefaultRule?: boolean;
};

export type FillGradientColorFieldPreset = {
  rules?: FillColorGradientFieldPresetRule[];
};

const StyledParameterItem = styled(ParameterItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `2px solid transparent`,
  boxShadow: theme.shadows[1],
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  width: `calc(100% - ${theme.spacing(-2)})`,
  marginLeft: theme.spacing(-1),
})) as unknown as typeof Select; // For generics

type SupportedFieldTypes = "POINT_FILL_COLOR_GRADIENT_FIELD" | "TILESET_FILL_COLOR_GRADIENT_FIELD";

export const EditorFillColorGradientField = ({
  component,
  onUpdate,
}: BasicFieldProps<SupportedFieldTypes>): ReactElement | null => {
  const [currentRuleId, setCurrentRuleId] = useState<string>();
  const [movingId, setMovingId] = useState<string>();

  const rules = useMemo(() => {
    return component?.preset?.rules ?? [];
  }, [component]);

  const currentRule = useMemo(() => {
    return rules.find(r => r.id === currentRuleId);
  }, [rules, currentRuleId]);

  const handleRuleCreate = useCallback(() => {
    const newRule: FillColorGradientFieldPresetRule = {
      id: generateID(),
    };
    onUpdate?.({
      ...component,
      preset: {
        ...component?.preset,
        rules: [...rules, newRule],
      },
    });
  }, [component, rules, onUpdate]);

  const handleRuleSelect = useCallback((id: string) => {
    setCurrentRuleId(id);
  }, []);

  const handleRuleRemove = useCallback(
    (id: string) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: rules.filter(r => r.id !== id),
        },
      });
    },
    [component, rules, onUpdate],
  );

  const handleRuleMove = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = rules.findIndex(r => r.id === id);
      if (index === -1) return;
      setMovingId(id);
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= rules.length) return;
      const newRules = [...rules];
      newRules.splice(index, 1);
      newRules.splice(newIndex, 0, rules[index]);
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: newRules,
        },
      });
    },
    [component, rules, onUpdate],
  );

  const handleRuleUpdate = useCallback(
    (rule: FillColorGradientFieldPresetRule) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: rules.map(r => (r.id === rule.id ? rule : r)),
        },
      });
    },
    [component, rules, onUpdate],
  );

  useEffect(() => {
    if (movingId) {
      setTimeout(() => {
        if (movingId) setMovingId(undefined);
      }, 200);
    }
  }, [movingId]);

  const handleColorMapNameChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      if (!currentRule) return;
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: rules.map(r =>
            r.id === currentRule.id ? { ...r, colorMapName: e.target.value } : r,
          ),
        },
      });
    },
    [component, currentRule, rules, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox asMenu halfWidth>
        {rules.map((rule, index) => (
          <PropertyCard
            key={rule.id}
            id={rule.id}
            selected={rule.id === currentRule?.id}
            movingId={movingId}
            moveUpDisabled={index === 0}
            moveDownDisabled={index === rules.length - 1}
            onMove={handleRuleMove}
            onRemove={handleRuleRemove}
            onSelect={handleRuleSelect}
            mainPanel={<RuleMainPanel rule={rule} onRuleUpdate={handleRuleUpdate} />}
            legendPanel={
              <RuleLegendPanel
                rule={rule}
                onRuleUpdate={handleRuleUpdate}
                component={component}
                onUpdate={onUpdate}
              />
            }
          />
        ))}
        <PropertyButton onClick={handleRuleCreate}>
          <AddOutlinedIcon /> Rule
        </PropertyButton>
      </PropertyBox>
      {currentRule && (
        <PropertyBox>
          <StyledParameterItem labelFontSize={"small"} label={"Gradient colors"} gutterBottom>
            <StyledSelect
              variant="filled"
              fullWidth
              value={currentRule.colorMapName}
              onChange={handleColorMapNameChange}>
              {COLOR_MAPS.map(colorMap => (
                <SelectItem key={colorMap.name} value={colorMap.name}>
                  <ColorMapSelectItemContent colorMap={colorMap} />
                </SelectItem>
              ))}
            </StyledSelect>
          </StyledParameterItem>
        </PropertyBox>
      )}
    </PropertyWrapper>
  );
};

type RulePanelProps = {
  rule: FillColorGradientFieldPresetRule;
  onRuleUpdate: (rule: FillColorGradientFieldPresetRule) => void;
  component?: SettingComponent<SupportedFieldTypes>;
  onUpdate?: (component: SettingComponent<SupportedFieldTypes>) => void;
};

const RuleMainPanel: React.FC<RulePanelProps> = ({ rule, onRuleUpdate }) => {
  const handlePropertyNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onRuleUpdate({
        ...rule,
        propertyName: e.target.value,
      });
    },
    [rule, onRuleUpdate],
  );

  const [minText, handleMinChange] = useNumberFieldState(
    rule.min,
    useCallback(
      v => {
        onRuleUpdate({
          ...rule,
          min: v ?? 0,
        });
      },
      [rule, onRuleUpdate],
    ),
  );

  const [maxText, handleMaxChange] = useNumberFieldState(
    rule.max,
    useCallback(
      v => {
        onRuleUpdate({
          ...rule,
          max: v ?? 0,
        });
      },
      [rule, onRuleUpdate],
    ),
  );

  return (
    <>
      <PropertyInputField
        placeholder="Property Name"
        value={rule.propertyName ?? ""}
        onChange={handlePropertyNameChange}
      />
      <PropertyLineWrapper>
        <PropertyInputField
          type="number"
          placeholder="Min"
          value={minText ?? ""}
          onChange={handleMinChange}
        />
        ~
        <PropertyInputField
          placeholder="Max"
          type="number"
          value={maxText ?? ""}
          onChange={handleMaxChange}
        />
      </PropertyLineWrapper>
    </>
  );
};

const RuleLegendPanel: React.FC<RulePanelProps> = ({ rule, onRuleUpdate, component, onUpdate }) => {
  const handleLegendNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onRuleUpdate({
        ...rule,
        legendName: e.target.value,
      });
    },
    [rule, onRuleUpdate],
  );

  const handleAsDefaultRuleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!component?.id) return;
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: component.preset?.rules?.map(r =>
            r.id === rule.id
              ? {
                  ...r,
                  asDefaultRule: !!e.target.checked,
                }
              : e.target.checked
              ? {
                  ...r,
                  asDefaultRule: false,
                }
              : r,
          ),
        },
      });
    },
    [rule, component, onUpdate],
  );

  return (
    <>
      <PropertyInputField
        placeholder="Rule Name"
        value={rule.legendName ?? ""}
        onChange={handleLegendNameChange}
      />
      <PropertySwitch
        label="As Default"
        checked={rule.asDefaultRule}
        onChange={handleAsDefaultRuleChange}
      />
    </>
  );
};
