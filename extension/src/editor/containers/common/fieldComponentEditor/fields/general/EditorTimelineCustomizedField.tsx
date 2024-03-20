import { useCallback } from "react";

import { BasicFieldProps } from "..";
import {
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertySelectField,
  PropertyWrapper,
} from "../../../../ui-components";

const timezoneOptions = [
  -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
].map(v => ({
  label: `UTC${v > 0 ? "+" : ""}${v}`,
  value: `${v > 0 ? "+" : ""}${v}`,
}));

export type EditorTimelineCustomizedFieldPreset = {
  start?: string;
  end?: string;
  current?: string;
  timezone?: string;
  defaultUnit?: number;
  defaultAmount?: number;
};

const speedUnitOptions = [
  {
    value: 1,
    label: "秒",
  },
  {
    value: 60,
    label: "分",
  },
  {
    value: 3600,
    label: "時間",
  },
];

const speedAmountOptions = [
  {
    value: 1,
    label: "1",
  },
  {
    value: 5,
    label: "5",
  },
  {
    value: 10,
    label: "10",
  },
  {
    value: 30,
    label: "30",
  },
];

export const EditorTimelineCustomizedField: React.FC<
  BasicFieldProps<"TIMELINE_CUSTOMIZED_FIELD">
> = ({ component, onUpdate }) => {
  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          start: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  const handleCurrentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          current: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          end: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  const handleTimezoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          timezone: e.target.value,
        },
      });
    },
    [component, onUpdate],
  );

  const handleDefaultUnitChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          defaultUnit: Number(e.target.value),
        },
      });
    },
    [component, onUpdate],
  );

  const handleDefaultAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          defaultAmount: Number(e.target.value),
        },
      });
    },
    [component, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInlineWrapper label="Start Time">
          <PropertyInputField
            placeholder="ISO8601 Time String"
            value={component.preset?.start ?? ""}
            onChange={handleStartChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Current Time">
          <PropertyInputField
            placeholder="ISO8601 Time String"
            value={component.preset?.current ?? ""}
            onChange={handleCurrentChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="End Time">
          <PropertyInputField
            placeholder="ISO8601 Time String"
            value={component.preset?.end ?? ""}
            onChange={handleEndChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Display Timezone">
          <PropertySelectField
            options={timezoneOptions}
            value={component.preset?.timezone ?? "+9"}
            onChange={handleTimezoneChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Default Value">
          <PropertySelectField
            options={speedAmountOptions}
            value={component.preset?.defaultAmount ?? 1}
            onChange={handleDefaultAmountChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Default Unit">
          <PropertySelectField
            options={speedUnitOptions}
            value={component.preset?.defaultUnit ?? 60}
            onChange={handleDefaultUnitChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
    </PropertyWrapper>
  );
};
