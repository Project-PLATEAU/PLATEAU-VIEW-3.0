import { useCallback, useEffect, useMemo, useState } from "react";

import { DraftSetting, UpdateSetting } from "..";
import { FeatureClickEventType, FeatureClickUrlType } from "../../../../shared/api/types";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorSelect,
  EditorTextField,
} from "../../ui-components";

type FeatureClickEventTypeOption = Exclude<FeatureClickEventType, undefined> | "inherit";
type FeatureClickUrlTypeOption = Exclude<FeatureClickUrlType, undefined> | "inherit";

const eventTypeOptions: { label: string; value: FeatureClickEventTypeOption }[] = [
  {
    label: "Inherit",
    value: "inherit",
  },
  {
    label: "Open feature inspector",
    value: "openFeatureInspector",
  },
  {
    label: "Open new tab",
    value: "openNewTab",
  },
];

const urlTypeOptions: { label: string; value: FeatureClickUrlTypeOption }[] = [
  {
    label: "Inherit",
    value: "inherit",
  },
  {
    label: "Manual",
    value: "manual",
  },
  {
    label: "From data",
    value: "fromData",
  },
];

export type EventBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  updateSetting?: UpdateSetting;
};

export const EventBlock: React.FC<EventBlockProps> = ({ setting, updateSetting, ...props }) => {
  const [eventType, setEventType] = useState<FeatureClickEventTypeOption>(
    setting?.general?.featureClickEvent?.eventType ?? "inherit",
  );
  const [urlType, setUrlType] = useState<FeatureClickUrlTypeOption>(
    setting?.general?.featureClickEvent?.urlType ?? "inherit",
  );
  const [websiteURL, setWebsiteURL] = useState(
    setting?.general?.featureClickEvent?.websiteURL ?? "",
  );
  const [fieldName, setFieldName] = useState(setting?.general?.featureClickEvent?.fieldName ?? "");

  const handleEventTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEventType(e.target.value as FeatureClickEventTypeOption);
    if (e.target.value === "inherit") {
      setUrlType("inherit");
      setWebsiteURL("");
      setFieldName("");
    }
  }, []);

  const handleUrlTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlType(e.target.value as FeatureClickUrlTypeOption);
    if (e.target.value === "inherit") {
      setWebsiteURL("");
      setFieldName("");
    }
  }, []);

  const handleWebsiteUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsiteURL(e.target.value);
  }, []);

  const handleFieldNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldName(e.target.value);
  }, []);

  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return s;
      return {
        ...s,
        general: {
          ...s?.general,
          featureClickEvent:
            eventType !== "inherit" || urlType !== "inherit" || websiteURL || fieldName
              ? {
                  eventType: eventType !== "inherit" ? eventType : undefined,
                  urlType: urlType !== "inherit" ? urlType : undefined,
                  websiteURL: websiteURL ? websiteURL : undefined,
                  fieldName: fieldName ? fieldName : undefined,
                }
              : undefined,
        },
      };
    });
  }, [eventType, urlType, websiteURL, fieldName, updateSetting]);

  const clearBlock = useCallback(() => {
    setEventType("inherit");
    setUrlType("inherit");
    setWebsiteURL("");
    setFieldName("");
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
    <EditorBlock title="Event" expandable actions={actions} {...props}>
      <BlockContentWrapper>
        <EditorSelect
          label="Feature Click Event Type"
          value={eventType}
          options={eventTypeOptions}
          onChange={handleEventTypeChange}
        />
        {eventType === "openNewTab" && (
          <EditorSelect
            label="URL Type"
            value={urlType}
            options={urlTypeOptions}
            onChange={handleUrlTypeChange}
          />
        )}
        {eventType === "openNewTab" && urlType === "manual" && (
          <EditorTextField
            label="Website URL"
            value={websiteURL}
            onChange={handleWebsiteUrlChange}
          />
        )}
        {eventType === "openNewTab" && urlType === "fromData" && (
          <EditorTextField label="Field Name" value={fieldName} onChange={handleFieldNameChange} />
        )}
      </BlockContentWrapper>
    </EditorBlock>
  );
};
