import { useAtomValue } from "jotai";
import { useMemo, useState, useCallback, useEffect } from "react";

import { useTemplateAPI } from "../../../shared/api";
import { EmphasisPropertyTemplate } from "../../../shared/api/types";
import { TemplateAddButton } from "../common/commonTemplate/TemplateAddButton";
import { TemplateHeader } from "../common/commonTemplate/TemplateHeader";
import { EditorSection, EditorTree, EditorTreeSelection } from "../ui-components";
import { EditorNoticeRef } from "../ui-components/editor/EditorNotice";
import { VIRTUAL_ROOT, convertTemplatesToTree, getSelectedPath } from "../utils";

import { EmphasisPropertyTemplatePage } from "./emphasisPropertyTemplatePage";

export type EditorEmphasisPropertyTemplateContentType = "folder" | "template" | "empty";
export type EditorEmphasisPropertyTemplateItemProperty = {
  templateId?: string;
};

export type UpdateTemplate = React.Dispatch<
  React.SetStateAction<EmphasisPropertyTemplate | undefined>
>;

type EditorInspectorEmphasisPropertyTemplateSectionProps = {
  editorNoticeRef?: React.RefObject<EditorNoticeRef>;
};

export const EditorInspectorEmphasisPropertyTemplateSection: React.FC<
  EditorInspectorEmphasisPropertyTemplateSectionProps
> = ({ editorNoticeRef }) => {
  const [contentType, setContentType] =
    useState<EditorEmphasisPropertyTemplateContentType>("empty");
  const [templateId, setTemplateId] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  const { templatesAtom, saveTemplate, removeTemplate } = useTemplateAPI();
  const templates = useAtomValue(templatesAtom);

  const emphasisPropertyTemplates = useMemo(
    () =>
      templates
        ? (templates?.filter(t => t.type === "emphasis") as EmphasisPropertyTemplate[])
        : [],
    [templates],
  );

  const templatesTree = useMemo(
    () => convertTemplatesToTree(emphasisPropertyTemplates),
    [emphasisPropertyTemplates],
  );

  const [template, updateTemplate] = useState<EmphasisPropertyTemplate | undefined>();

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
    updateTemplate(emphasisPropertyTemplates.find(c => c.id === templateId));
  }, [emphasisPropertyTemplates, templateId]);

  const templateNames = useMemo(
    () => emphasisPropertyTemplates.map(t => t.name),
    [emphasisPropertyTemplates],
  );
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
        type: "emphasis",
        properties: [],
      } as unknown as EmphasisPropertyTemplate)
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
        template && (
          <EmphasisPropertyTemplatePage template={template} updateTemplate={updateTemplate} />
        )
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
