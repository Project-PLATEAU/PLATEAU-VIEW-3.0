import { useCallback } from "react";

import { PropertyInputField } from "./PropertyInputField";
import { OperationValue, PropertyOperationSelectField } from "./PropertyOperationSelectField";
import { PropertyLineWrapper } from "./PropertyWrapper";

export type CommonCondition = {
  propertyName?: string;
  operation?: OperationValue;
  value?: string;
};

type PropertyConditionFieldProps = {
  condition: CommonCondition;
  onConditionChange: (condition: CommonCondition) => void;
};

export const PropertyConditionField: React.FC<PropertyConditionFieldProps> = ({
  condition,
  onConditionChange,
}) => {
  const handleOperationChange = useCallback(
    (v: OperationValue) => {
      onConditionChange({
        ...condition,
        operation: v,
      });
    },
    [condition, onConditionChange],
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionChange({
        ...condition,
        value: e.target.value,
      });
    },
    [condition, onConditionChange],
  );

  const handlePropertyNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionChange({
        ...condition,
        propertyName: e.target.value,
      });
    },
    [condition, onConditionChange],
  );

  return (
    <PropertyLineWrapper>
      IF
      <PropertyInputField
        placeholder="Property name"
        value={condition.propertyName ?? ""}
        title="Left empty to use rule's property name"
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
  );
};
