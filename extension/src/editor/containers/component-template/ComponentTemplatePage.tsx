import { useCallback } from "react";

import { ComponentGroup, ComponentTemplate } from "../../../shared/api/types";
import { FieldComponentEditor } from "../common/fieldComponentEditor";

import { UpdateTemplate } from ".";

type ComponentTemplatePageProps = {
  template: ComponentTemplate;
  updateTemplate: UpdateTemplate;
};

export const ComponentTemplatePage: React.FC<ComponentTemplatePageProps> = ({
  template,
  updateTemplate,
}) => {
  const handleUpdateComponentGroups = useCallback(
    (groups: ComponentGroup[]) => {
      updateTemplate?.(t => {
        if (!t?.id) return t;
        return { ...t, groups };
      });
    },
    [updateTemplate],
  );

  return (
    <FieldComponentEditor
      componentsGroups={template.groups}
      onComponentGroupsUpdate={handleUpdateComponentGroups}
    />
  );
};
