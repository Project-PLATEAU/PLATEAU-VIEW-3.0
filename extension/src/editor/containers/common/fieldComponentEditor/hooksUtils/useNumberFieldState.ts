import { useCallback, useState } from "react";

export const useNumberFieldState = (
  initialValue: number | undefined,
  onUpdate: (value: number) => void,
): [string, (e: React.ChangeEvent<HTMLInputElement>) => void] => {
  const [value, setValue] = useState(() =>
    initialValue !== undefined && initialValue !== null ? initialValue.toString() : "",
  );
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      onUpdate(Number(e.target.value) ?? 0);
    },
    [onUpdate],
  );

  return [value, handleChange];
};
