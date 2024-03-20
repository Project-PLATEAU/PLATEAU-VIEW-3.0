import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useMemo, useCallback, ReactElement, useState } from "react";

import { BasicFieldProps } from "..";
import { generateID } from "../../../../../../shared/utils/id";
import {
  PropertyBox,
  PropertyInputField,
  PropertySwitch,
  PropertyWrapper,
  PropertyLineWrapper,
  PropertyButton,
  PropertyCard,
} from "../../../../ui-components";
import {
  OperationValue,
  PropertyOperationSelectField,
} from "../../../../ui-components/property/PropertyOperationSelectField";

type SupportedFieldTypes =
  | "POINT_VISIBILITY_CONDITION_FIELD"
  | "POLYLINE_VISIBILITY_CONDITION_FIELD"
  | "POLYGON_VISIBILITY_CONDITION_FIELD";

type VisibilityConditionFieldPresetCondition = {
  id: string;
  propertyName?: string;
  operation?: OperationValue;
  value?: string;
  show?: boolean;
};

export type VisibilityConditionFieldPreset = {
  conditions: VisibilityConditionFieldPresetCondition[];
};

export const EditorVisibilityConditionField = ({
  component,
  onUpdate,
}: BasicFieldProps<SupportedFieldTypes>): ReactElement | null => {
  const conditions = useMemo(() => {
    return component?.preset?.conditions ?? [];
  }, [component?.preset]);

  const handleConditionUpdate = useCallback(
    (condition: VisibilityConditionFieldPresetCondition) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          conditions: conditions.map(c => (c.id === condition.id ? condition : c)),
        },
      });
    },
    [component, onUpdate, conditions],
  );

  const handleConditionCreate = useCallback(() => {
    const newCondition: VisibilityConditionFieldPresetCondition = {
      id: generateID(),
    };
    onUpdate?.({
      ...component,
      preset: {
        ...component?.preset,
        conditions: [...conditions, newCondition],
      },
    });
  }, [component, conditions, onUpdate]);

  const handleConditionRemove = useCallback(
    (id: string) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          conditions: conditions.filter(c => c.id !== id),
        },
      });
    },
    [component, conditions, onUpdate],
  );

  const [movingId, setMovingId] = useState<string>();
  const handleConditionMove = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = conditions.findIndex(c => c.id === id);
      if (index === -1) return;
      setMovingId(id);
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= conditions.length) return;
      const newConditions = [...conditions];
      newConditions.splice(index, 1);
      newConditions.splice(newIndex, 0, conditions[index]);
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          conditions: newConditions,
        },
      });
    },
    [component, conditions, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        {conditions.map((condition, index) => (
          <PropertyCard
            id={condition.id}
            key={condition.id}
            movingId={movingId}
            moveUpDisabled={index === 0}
            moveDownDisabled={index === conditions.length - 1}
            onMove={handleConditionMove}
            onRemove={handleConditionRemove}
            mainPanel={
              <ConditionPanel condition={condition} onConditionUpdate={handleConditionUpdate} />
            }
          />
        ))}
        <PropertyButton onClick={handleConditionCreate}>
          <AddOutlinedIcon /> Condition
        </PropertyButton>
      </PropertyBox>
    </PropertyWrapper>
  );
};

type ConditionPanelProps = {
  condition: VisibilityConditionFieldPresetCondition;
  onConditionUpdate: (condition: VisibilityConditionFieldPresetCondition) => void;
};

const ConditionPanel: React.FC<ConditionPanelProps> = ({ condition, onConditionUpdate }) => {
  const handlePropertyNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionUpdate({ ...condition, propertyName: e.target.value });
    },
    [condition, onConditionUpdate],
  );

  const handleOperationChange = useCallback(
    (v: OperationValue) => {
      onConditionUpdate({ ...condition, operation: v });
    },
    [condition, onConditionUpdate],
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionUpdate({ ...condition, value: e.target.value });
    },
    [condition, onConditionUpdate],
  );

  const handleShowChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionUpdate({
        ...condition,
        show: e.target.checked,
      });
    },
    [condition, onConditionUpdate],
  );

  return (
    <>
      <PropertyLineWrapper>
        IF
        <PropertyInputField
          placeholder="Property"
          value={condition.propertyName ?? ""}
          onChange={handlePropertyNameChange}
        />
        <PropertyOperationSelectField
          operation={condition.operation}
          onChange={handleOperationChange}
        />
        <PropertyInputField
          placeholder="Value"
          value={condition.value ?? ""}
          onChange={handleValueChange}
        />
      </PropertyLineWrapper>
      <PropertySwitch label="Show" checked={!!condition.show} onChange={handleShowChange} />
    </>
  );
};
