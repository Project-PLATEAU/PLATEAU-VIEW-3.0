import { useCallback, useEffect, useMemo, useState } from "react";

import { DraftSetting, UpdateSetting } from "..";
import {
  FeatureInspectorDisplayType,
  FeatureInspectorTitleType,
} from "../../../../shared/api/types";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorSelect,
  EditorTextField,
} from "../../ui-components";

export const DEFAULT_FEATURE_INSPECTOR_BASIC_BLOCK_VALUE: {
  titleType?: FeatureInspectorTitleType;
  customTitle?: string | undefined;
  displayType?: FeatureInspectorDisplayType;
} = {
  titleType: "datasetType",
  customTitle: undefined,
  displayType: undefined,
};

type FeatureInspectorTitleTypeOption = Exclude<FeatureInspectorTitleType, undefined> | "inherit";
type FeatureInspectorDisplayTypeOption =
  | Exclude<FeatureInspectorDisplayType, undefined>
  | "inherit";

type FeatureInspectorBasicBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  updateSetting?: UpdateSetting;
};

const titleTypeOptions: { label: string; value: FeatureInspectorTitleTypeOption }[] = [
  {
    label: "Inherit",
    value: "inherit",
  },
  {
    label: "Dataset type name",
    value: "datasetType",
  },
  {
    label: "Custom",
    value: "custom",
  },
];

const displayTypeOptions: { label: string; value: FeatureInspectorDisplayTypeOption }[] = [
  {
    label: "Inherit",
    value: "inherit",
  },
  {
    label: "Auto",
    value: "auto",
  },
  {
    label: "Built-in",
    value: "builtin",
  },
  {
    label: "Property list",
    value: "propertyList",
  },
  {
    label: "CZML description (HTML)",
    value: "CZMLDescription",
  },
];

export const FeatureInspectorBasicBlock: React.FC<FeatureInspectorBasicBlockProps> = ({
  setting,
  updateSetting,
  ...props
}) => {
  const [titleType, setTitleType] = useState<FeatureInspectorTitleTypeOption>(
    setting?.featureInspector?.basic?.titleType ?? "inherit",
  );
  const [customTitle, setCustomTitle] = useState(setting?.featureInspector?.basic?.customTitle);
  const [displayType, setDisplayType] = useState<FeatureInspectorDisplayTypeOption>(
    setting?.featureInspector?.basic?.displayType ?? "inherit",
  );

  const handleTitleTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleType(e.target.value as FeatureInspectorTitleTypeOption);
  }, []);

  const handleCustomTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTitle(e.target.value);
  }, []);

  const handleDisplayTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayType(e.target.value as FeatureInspectorDisplayTypeOption);
  }, []);

  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return s;
      return {
        ...s,
        featureInspector: {
          ...s?.featureInspector,
          basic:
            titleType !== "inherit" || customTitle || displayType !== "inherit"
              ? {
                  titleType: titleType !== "inherit" ? titleType : undefined,
                  customTitle: customTitle ? customTitle : undefined,
                  displayType: displayType !== "inherit" ? displayType : undefined,
                }
              : undefined,
        },
      };
    });
  }, [titleType, customTitle, displayType, updateSetting]);

  const clearBlock = useCallback(() => {
    setTitleType("inherit");
    setCustomTitle("");
    setDisplayType("inherit");
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
    <EditorBlock title="Basic Setting" expandable actions={actions} {...props}>
      <BlockContentWrapper>
        <EditorSelect
          label="Title Type"
          value={titleType}
          options={titleTypeOptions}
          onChange={handleTitleTypeChange}
        />
        {titleType === "custom" && (
          <EditorTextField
            label="Custom Title"
            value={customTitle}
            onChange={handleCustomTitleChange}
          />
        )}
        <EditorSelect
          label="Content Type"
          value={displayType}
          options={displayTypeOptions}
          onChange={handleDisplayTypeChange}
        />
      </BlockContentWrapper>
    </EditorBlock>
  );
};
