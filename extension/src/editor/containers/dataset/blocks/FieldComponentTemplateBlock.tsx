import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DraftSetting, EditorDataset, UpdateSetting } from "..";
import { useTemplateAPI } from "../../../../shared/api";
import { ComponentGroup, ComponentTemplate } from "../../../../shared/api/types";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorCommonField,
  EditorSelect,
  EditorSwitch,
} from "../../ui-components";

type FieldComponentTemplateBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  dataset?: EditorDataset;
  componentsGroups?: ComponentGroup[];
  updateSetting?: UpdateSetting;
};

export const FieldComponentTemplateBlock: React.FC<FieldComponentTemplateBlockProps> = ({
  setting,
  dataset,
  componentsGroups,
  updateSetting,
  ...props
}) => {
  const [useTemplate, setUseTemplate] = useState(!!setting?.fieldComponents?.useTemplate);
  const [templateId, setTemplateId] = useState<string>(setting?.fieldComponents?.templateId ?? "");

  const handleUseTemplateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUseTemplate(e.target.checked);
  }, []);

  const handleTemplateIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateId(e.target.value);
  }, []);

  const { templatesAtom } = useTemplateAPI();
  const templates = useAtomValue(templatesAtom);

  const componentTemplates = useMemo(
    () =>
      templates ? (templates?.filter(t => t.type === "component") as ComponentTemplate[]) : [],
    [templates],
  );

  const templateOptions = useMemo(
    () =>
      componentTemplates
        .map(t => ({ label: t.name, value: t.id }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [componentTemplates],
  );

  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return s;
      return {
        ...s,
        fieldComponents: {
          ...s?.fieldComponents,
          useTemplate,
          templateId,
        },
      };
    });
  }, [useTemplate, templateId, updateSetting]);

  const defaultTemplateName = useMemo(
    () =>
      !componentsGroups?.some(g => g.components.length > 0) &&
      templates.find(t =>
        [
          dataset?.type.name,
          dataset?.__typename === "PlateauDataset" ? dataset.subname ?? undefined : undefined,
        ].includes(t.name.split("/").slice(-1)[0]),
      )?.name,
    [dataset, templates, componentsGroups],
  );

  return (
    <EditorBlock title="Template" expandable {...props}>
      <BlockContentWrapper>
        <EditorCommonField label="Use template" inline>
          <EditorSwitch checked={useTemplate} onChange={handleUseTemplateChange} />
        </EditorCommonField>
        {useTemplate && (
          <EditorSelect
            label="Template"
            value={templateId}
            options={templateOptions}
            disabled={!useTemplate}
            onChange={handleTemplateIdChange}
          />
        )}
        {!useTemplate && defaultTemplateName && (
          <EditorCommonField>Default template detected: {defaultTemplateName}</EditorCommonField>
        )}
      </BlockContentWrapper>
    </EditorBlock>
  );
};
