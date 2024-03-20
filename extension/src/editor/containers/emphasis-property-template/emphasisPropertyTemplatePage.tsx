import { useCallback } from "react";

import { EmphasisProperty, EmphasisPropertyTemplate } from "../../../shared/api/types";
import { EmphasisPropertyEditor } from "../common/emphasisPropertyEditor";
import { BlockContentWrapper, EditorBlock } from "../ui-components";

import { UpdateTemplate } from ".";

type EmphasisPropertyTemplatePageProps = {
  template: EmphasisPropertyTemplate;
  updateTemplate: UpdateTemplate;
};

export const EmphasisPropertyTemplatePage: React.FC<EmphasisPropertyTemplatePageProps> = ({
  template,
  updateTemplate,
}) => {
  const handlePropertiesUpdate = useCallback(
    (properties: EmphasisProperty[]) => {
      updateTemplate?.(t => {
        if (!t?.id) return t;
        return { ...t, properties };
      });
    },
    [updateTemplate],
  );

  return (
    <EditorBlock title="Emphasis Properties">
      <BlockContentWrapper>
        <EmphasisPropertyEditor
          id={template.id}
          properties={template.properties}
          onPropertiesUpdate={handlePropertiesUpdate}
        />
      </BlockContentWrapper>
    </EditorBlock>
  );
};
