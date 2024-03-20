import { useCallback } from "react";

import { PropertySelectField } from "./PropertySelectField";

const operationOptions = [
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
  { value: "===", label: "=" },
  { value: "!==", label: "!=" },
  { value: "startsWith", label: "Starts with" },
] as const;

export type OperationValue = (typeof operationOptions)[number]["value"] | undefined;

export type CommonCondition = {
  operation?: OperationValue;
};

type PropertyOperationSelectFieldProps = {
  operation: OperationValue;
  onChange: (oparation: OperationValue) => void;
};

export const PropertyOperationSelectField: React.FC<PropertyOperationSelectFieldProps> = ({
  operation,
  onChange,
}) => {
  const handleOperationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as OperationValue);
    },
    [onChange],
  );

  return (
    <PropertySelectField
      placeholder="Operation"
      sx={{ width: "45px", flexShrink: 0 }}
      options={operationOptions as unknown as { value: string; label: string }[]}
      value={operation ?? ""}
      onChange={handleOperationChange}
    />
  );
};
