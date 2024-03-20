import { useAtomValue } from "jotai";
import { useMemo, useState, useCallback, useEffect, RefObject } from "react";

import { useTemplateAPI } from "../../../shared/api";
import { ComponentTemplate } from "../../../shared/api/types";
import { generateID } from "../../../shared/utils/id";
import { TemplateAddButton } from "../common/commonTemplate/TemplateAddButton";
import { TemplateHeader } from "../common/commonTemplate/TemplateHeader";
import { EditorSection, EditorTree, EditorTreeSelection } from "../ui-components";
import { EditorNoticeRef } from "../ui-components/editor/EditorNotice";
import { VIRTUAL_ROOT, convertTemplatesToTree, getSelectedPath } from "../utils";

import { ComponentTemplatePage } from "./ComponentTemplatePage";

export type EditorFieldComponentsTemplateContentType = "folder" | "template" | "empty";
export type EditorFieldComponentsTemplateItemProperty = {
  templateId?: string;
};

export type UpdateTemplate = React.Dispatch<React.SetStateAction<ComponentTemplate | undefined>>;

type EditorFieldComponentsTemplateSectionProps = {
  editorNoticeRef?: RefObject<EditorNoticeRef>;
};

export const EditorFieldComponentsTemplateSection: React.FC<
  EditorFieldComponentsTemplateSectionProps
> = ({ editorNoticeRef }) => {
  const [contentType, setContentType] = useState<EditorFieldComponentsTemplateContentType>("empty");
  const [templateId, setTemplateId] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  const { templatesAtom, saveTemplate, removeTemplate } = useTemplateAPI();
  const templates = useAtomValue(templatesAtom);

  const componentTemplates = useMemo(
    () =>
      templates ? (templates?.filter(t => t.type === "component") as ComponentTemplate[]) : [],
    [templates],
  );

  const templatesTree = useMemo(
    () => convertTemplatesToTree(componentTemplates),
    [componentTemplates],
  );

  const [template, updateTemplate] = useState<ComponentTemplate | undefined>();

  const [expanded, setExpanded] = useState<string[]>([VIRTUAL_ROOT.id]);
  const [selected, setSelected] = useState<string>("");

  const handleItemClick = useCallback(({ id, templateId }: EditorTreeSelection) => {
    setSelected(id);
    setContentType(templateId ? "template" : "folder");
    setTemplateId(templateId);
  }, []);

  const handleExpandClick = useCallback(
    (id: string) => {
      if (expanded.includes(id)) {
        setExpanded(expanded.filter(e => e !== id));
      } else {
        setExpanded([...expanded, id]);
      }
    },
    [expanded],
  );

  const showSaveButton = useMemo(
    () => contentType === "template" && !!template,
    [template, contentType],
  );

  useEffect(() => {
    updateTemplate(componentTemplates.find(c => c.id === templateId));
  }, [componentTemplates, templateId]);

  useEffect(() => {
    if (!template) return;
    if (!template.groups || template.groups.length === 0) {
      updateTemplate({
        ...template,
        groups: [
          {
            id: generateID(),
            name: "Default",
            components: [],
          },
        ],
      });
    }
  }, [template]);

  const templateNames = useMemo(() => componentTemplates.map(t => t.name), [componentTemplates]);
  const base = useMemo(() => {
    const paths = getSelectedPath(templatesTree, selected);
    if (contentType === "template") paths.splice(-1, 1);
    const fullPath = paths.join("/");
    return fullPath === "" ? "" : `${fullPath}/`;
  }, [templatesTree, selected, contentType]);

  const handleTemplateAdd = useCallback(
    async (newTemplateName: string) => {
      setIsSaving(true);
      await saveTemplate({
        name: newTemplateName,
        type: "component",
        groups: [],
      } as unknown as ComponentTemplate)
        .then(() => {
          editorNoticeRef?.current?.show({
            severity: "success",
            message: "Template added!",
          });
        })
        .catch(() => {
          editorNoticeRef?.current?.show({
            severity: "error",
            message: "Template add failed!",
          });
        })
        .finally(() => {
          setIsSaving(false);
        });
    },
    [editorNoticeRef, saveTemplate],
  );

  const handleTemplateSave = useCallback(async () => {
    if (!template) return;
    setIsSaving(true);
    await saveTemplate(template)
      .then(() => {
        editorNoticeRef?.current?.show({
          severity: "success",
          message: "Template saved!",
        });
      })
      .catch(() => {
        editorNoticeRef?.current?.show({
          severity: "error",
          message: "Template save failed!",
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [editorNoticeRef, template, saveTemplate]);

  const handleTemplateRename = useCallback(
    async (newTemplateName: string) => {
      if (!template) return;
      setIsSaving(true);
      await saveTemplate({
        ...template,
        name: newTemplateName,
      })
        .then(() => {
          editorNoticeRef?.current?.show({
            severity: "success",
            message: "Template renamed!",
          });
        })
        .catch(() => {
          editorNoticeRef?.current?.show({
            severity: "error",
            message: "Template rename failed!",
          });
        })
        .finally(() => {
          setIsSaving(false);
        });
    },
    [editorNoticeRef, template, saveTemplate],
  );

  const handleTemplateRemove = useCallback(
    async (templateId: string) => {
      if (!templateId) return;
      setIsSaving(true);
      await removeTemplate(templateId)
        .then(() => {
          editorNoticeRef?.current?.show({
            severity: "success",
            message: "Template removed!",
          });
          setTemplateId(undefined);
        })
        .catch(() => {
          editorNoticeRef?.current?.show({
            severity: "error",
            message: "Template remove failed!",
          });
        })
        .finally(() => {
          setIsSaving(false);
        });
    },
    [editorNoticeRef, removeTemplate],
  );

  return (
    <EditorSection
      sidebarMain={
        <EditorTree
          tree={templatesTree}
          selected={selected}
          expanded={expanded}
          ready={!!templatesTree}
          onItemClick={handleItemClick}
          onExpandClick={handleExpandClick}
        />
      }
      sidebarBottom={
        <TemplateAddButton
          templateNames={templateNames}
          base={base}
          disabled={isSaving}
          onTemplateAdd={handleTemplateAdd}
        />
      }
      main={
        contentType === "template" &&
        template && <ComponentTemplatePage template={template} updateTemplate={updateTemplate} />
      }
      header={
        contentType === "template" &&
        template && (
          <TemplateHeader
            templateId={template.id}
            templateName={template?.name}
            templateNames={templateNames}
            onTemplateRename={handleTemplateRename}
            onTemplateRemove={handleTemplateRemove}
          />
        )
      }
      saveDisabled={!template || isSaving}
      showSaveButton={showSaveButton}
      onSave={handleTemplateSave}
    />
  );
};
