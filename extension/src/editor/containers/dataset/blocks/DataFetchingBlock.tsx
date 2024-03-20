import { InputAdornment } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DraftSetting, UpdateSetting } from "..";
import { DataFetchingEnableType } from "../../../../shared/api/types";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorSelect,
  EditorTextField,
} from "../../ui-components";

type DataFetchingBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  updateSetting?: UpdateSetting;
};

type DataFetchingEnableTypeOption =
  | Exclude<DataFetchingEnableType, undefined | boolean>
  | "inherit"
  | "true"
  | "false";

const dataFetchingEnableTypeOptions: { label: string; value: DataFetchingEnableTypeOption }[] = [
  {
    label: "Inherit",
    value: "inherit",
  },
  {
    label: "Enabled",
    value: "true",
  },
  {
    label: "Disabled",
    value: "false",
  },
];

export const DataFetchingBlock: React.FC<DataFetchingBlockProps> = ({
  setting,
  updateSetting,
  ...props
}) => {
  const [enabled, setEnabled] = useState(setting?.general?.dataFetching?.enabled ?? "inherit");
  const [timeInterval, setTimeInterval] = useState<number | string>(
    setting?.general?.dataFetching?.timeInterval ?? "",
  );

  const handleEnabledChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(e.target.value);
  }, []);

  const handleTimeIntervalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const numberTimeInteval = e.target.value === "" ? NaN : Number(e.target.value);
    setTimeInterval(isNaN(numberTimeInteval) ? "" : numberTimeInteval);
  }, []);

  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return s;
      return {
        ...s,
        general: {
          ...s?.general,
          dataFetching:
            enabled !== "inherit"
              ? {
                  enabled: enabled === "true" ? true : enabled === "false" ? false : undefined,
                  timeInterval: timeInterval === "" ? undefined : Number(timeInterval),
                }
              : undefined,
        },
      };
    });
  }, [enabled, timeInterval, updateSetting]);

  const clearBlock = useCallback(() => {
    setEnabled("inherit");
    setTimeInterval("");
  }, []);

  const actions = useMemo(() => {
    return [
      {
        label: "Clear",
        onClick: clearBlock,
      },
    ];
  }, [clearBlock]);

  return (
    <EditorBlock title="Data Fetching" actions={actions} expandable {...props}>
      <BlockContentWrapper>
        <EditorSelect
          label="Enable realtime data fetching"
          value={enabled}
          options={dataFetchingEnableTypeOptions}
          onChange={handleEnabledChange}
        />
        {enabled === "true" && (
          <EditorTextField
            label="Time Interval"
            value={timeInterval}
            onChange={handleTimeIntervalChange}
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">s</InputAdornment>,
            }}
          />
        )}
      </BlockContentWrapper>
    </EditorBlock>
  );
};
