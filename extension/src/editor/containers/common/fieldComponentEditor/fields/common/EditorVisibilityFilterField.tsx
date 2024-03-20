import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useState, useMemo, useCallback, useEffect } from "react";

import { BasicFieldProps } from "..";
import { SettingComponent } from "../../../../../../shared/api/types";
import { generateID } from "../../../../../../shared/utils/id";
import {
  PropertyBox,
  PropertyButton,
  PropertyCard,
  PropertyInputField,
  PropertySwitch,
  PropertyWrapper,
  CommonCondition,
  PropertyConditionField,
} from "../../../../ui-components";
import { OperationValue } from "../../../../ui-components/property/PropertyOperationSelectField";

type VisibilityFilterFieldPresetRule = {
  id: string;
  propertyName?: string;
  legendName?: string;
  asDefaultRule?: boolean;
  conditions?: VisibilityFilterFieldPresetRuleCondition[];
};

type VisibilityFilterFieldPresetRuleCondition = {
  id: string;
  operation?: OperationValue;
  value?: string;
  asLegend?: boolean;
  legendName?: string;
};

export type VisibilityFilterFieldPreset = {
  rules?: VisibilityFilterFieldPresetRule[];
};

type SupportedFieldTypes =
  | "POINT_VISIBILITY_FILTER_FIELD"
  | "POLYLINE_VISIBILITY_FILTER_FIELD"
  | "POLYGON_VISIBILITY_FILTER_FIELD";

export const EditorVisibilityFilterField: React.FC<BasicFieldProps<SupportedFieldTypes>> = ({
  component,
  onUpdate,
}) => {
  const [currentRuleId, setCurrentRuleId] = useState<string>();
  const [movingId, setMovingId] = useState<string>();

  const rules = useMemo(() => {
    return component?.preset?.rules ?? [];
  }, [component?.preset]);

  const currentRule = useMemo(() => {
    return rules.find(r => r.id === currentRuleId);
  }, [rules, currentRuleId]);

  const handleRuleCreate = useCallback(() => {
    const newRule: VisibilityFilterFieldPresetRule = {
      id: generateID(),
      conditions: [],
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
    (rule: VisibilityFilterFieldPresetRule) => {
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

  const handleConditionCreate = useCallback(() => {
    if (!currentRule) return;
    const newCondition = {
      id: generateID(),
    };
    onUpdate?.({
      ...component,
      preset: {
        ...component?.preset,
        rules: rules.map(r =>
          r.id === currentRule.id
            ? { ...r, conditions: [...(r.conditions ?? []), newCondition] }
            : r,
        ),
      },
    });
  }, [component, currentRule, rules, onUpdate]);

  const handleConditionMove = useCallback(
    (id: string, direction: "up" | "down") => {
      if (!currentRule?.conditions) return;
      const index = currentRule.conditions?.findIndex(c => c.id === id);
      if (index === -1) return;
      setMovingId(id);
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= currentRule.conditions.length) return;
      const newConditions = [...currentRule.conditions];
      newConditions.splice(index, 1);
      newConditions.splice(newIndex, 0, currentRule.conditions[index]);
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: rules.map(r =>
            r.id === currentRule.id ? { ...r, conditions: newConditions } : r,
          ),
        },
      });
    },
    [component, currentRule, rules, onUpdate],
  );

  const handleConditionRemove = useCallback(
    (id: string) => {
      if (!currentRule?.conditions) return;
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: rules.map(r =>
            r.id === currentRule.id
              ? { ...r, conditions: r.conditions?.filter(c => c.id !== id) }
              : r,
          ),
        },
      });
    },
    [component, currentRule, rules, onUpdate],
  );

  const handleConditionUpdate = useCallback(
    (condition: VisibilityFilterFieldPresetRuleCondition) => {
      if (!currentRule?.conditions) return;
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          rules: rules.map(r =>
            r.id === currentRule.id
              ? {
                  ...r,
                  conditions: r.conditions?.map(c => (c.id === condition.id ? condition : c)),
                }
              : r,
          ),
        },
      });
    },
    [component, currentRule, rules, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox asMenu>
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
      <PropertyBox>
        {currentRule?.conditions?.map((condition, index) => (
          <PropertyCard
            key={condition.id}
            id={condition.id}
            movingId={movingId}
            moveUpDisabled={index === 0}
            moveDownDisabled={index === rules.length - 1}
            onMove={handleConditionMove}
            onRemove={handleConditionRemove}
            mainPanel={
              <ConditionMainPanel condition={condition} onConditionUpdate={handleConditionUpdate} />
            }
            legendPanel={
              <ConditionLegendPanel
                condition={condition}
                onConditionUpdate={handleConditionUpdate}
              />
            }
          />
        ))}
        {currentRule && (
          <PropertyButton onClick={handleConditionCreate}>
            <AddOutlinedIcon /> Condition
          </PropertyButton>
        )}
      </PropertyBox>
    </PropertyWrapper>
  );
};

type RulePanelProps = {
  rule: VisibilityFilterFieldPresetRule;
  onRuleUpdate: (rule: VisibilityFilterFieldPresetRule) => void;
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

  return (
    <PropertyInputField
      placeholder="Property Name"
      value={rule.propertyName ?? ""}
      onChange={handlePropertyNameChange}
    />
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

type ConditionPanelProps = {
  condition: VisibilityFilterFieldPresetRuleCondition;
  onConditionUpdate: (condition: VisibilityFilterFieldPresetRuleCondition) => void;
};

const ConditionMainPanel: React.FC<ConditionPanelProps> = ({ condition, onConditionUpdate }) => {
  const handleConditionChange = useCallback(
    (newCondition: CommonCondition) => {
      onConditionUpdate({
        ...condition,
        ...newCondition,
      });
    },
    [condition, onConditionUpdate],
  );

  return <PropertyConditionField condition={condition} onConditionChange={handleConditionChange} />;
};

const ConditionLegendPanel: React.FC<ConditionPanelProps> = ({ condition, onConditionUpdate }) => {
  const handleLegendNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionUpdate({
        ...condition,
        legendName: e.target.value,
      });
    },
    [condition, onConditionUpdate],
  );

  const handleAsLegendChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionUpdate({
        ...condition,
        asLegend: e.target.checked,
      });
    },
    [condition, onConditionUpdate],
  );

  return (
    <>
      <PropertySwitch
        label="As Legend"
        checked={!!condition.asLegend}
        onChange={handleAsLegendChange}
      />
      <PropertyInputField
        placeholder="Legend Name"
        value={condition.legendName ?? ""}
        onChange={handleLegendNameChange}
      />
    </>
  );
};
