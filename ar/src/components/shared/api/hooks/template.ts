import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";

import {
  templatesAtom,
  updateTemplateAtom,
  addTemplateAtom,
  removeTemplateByIdAtom,
} from "../../states/template";
import { Template } from "../types";

import { useTemplateClient } from "./useTemplateClient";

export default () => {
  const client = useTemplateClient();
  const [isSaving, setIsSaving] = useState(false);

  const updateTemplate = useSetAtom(updateTemplateAtom);
  const addTemplate = useSetAtom(addTemplateAtom);
  const saveTemplate = useCallback(
    async (template: Template) => {
      setIsSaving(true);
      const isUpdate = !!template.id;
      const nextTemplate = await (async () => {
        if (isUpdate) {
          return await client.update(template.id, template);
        } else {
          return await client.save(template);
        }
      })();

      if (isUpdate) {
        updateTemplate(nextTemplate);
      } else {
        addTemplate(nextTemplate);
      }

      setIsSaving(false);
    },
    [client, updateTemplate, addTemplate],
  );

  const removeTemplateById = useSetAtom(removeTemplateByIdAtom);
  const removeTemplate = useCallback(
    async (templateId: string) => {
      if (!templateId) return;
      await client.delete(templateId);

      removeTemplateById(templateId);
    },
    [client, removeTemplateById],
  );

  return {
    isSaving,
    templatesAtom,
    saveTemplate,
    removeTemplate,
  };
};
