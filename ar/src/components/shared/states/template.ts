import { PrimitiveAtom, atom } from "jotai";
import { splitAtom } from "jotai/utils";

import { Template } from "../api/types";

import { forceUpdateRootLayer } from "./rootLayer";

export const templatesAtom = atom<Template[]>([]);
export const templatesAtomsAtom = splitAtom(templatesAtom);

export const addTemplateAtom = atom(undefined, (_get, set, template: Template) => {
  set(templatesAtomsAtom, {
    type: "insert",
    value: template,
  });
  set(forceUpdateRootLayer);
});

export const removeTemplateAtom = atom(
  undefined,
  (_get, set, template: PrimitiveAtom<Template>) => {
    set(templatesAtomsAtom, {
      type: "remove",
      atom: template,
    });
    set(forceUpdateRootLayer);
  },
);

export const removeTemplateByIdAtom = atom(undefined, (get, set, templateId: string) => {
  const templates = get(templatesAtomsAtom);
  const templateAtom = templates.find(t => {
    const template = get(t);
    return template.id === templateId;
  });
  if (templateAtom) {
    set(templatesAtomsAtom, {
      type: "remove",
      atom: templateAtom,
    });
    set(forceUpdateRootLayer);
  }
});

export const updateTemplateAtom = atom(undefined, (get, set, template: Template) => {
  const templates = get(templatesAtomsAtom);
  const templateAtom = templates.find(t => {
    const prevTemplate = get(t);
    return prevTemplate.id === template.id;
  });
  if (templateAtom) {
    set(templateAtom, template);
    set(forceUpdateRootLayer);
  }
});

export const updateAllTemplateAtom = atom(undefined, (_get, set, templates: Template[]) => {
  set(templatesAtom, templates);
  set(forceUpdateRootLayer);
});
