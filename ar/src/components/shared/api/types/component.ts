import type { Component, ComponentBase } from "../../types/fieldComponents";

export type SettingComponent<T extends ComponentBase["type"] = ComponentBase["type"]> = {
  id: string;
} & Omit<Component<T>, "value">;

export type ComponentGroup = {
  id: string;
  name: string;
  components: SettingComponent<ComponentBase["type"]>[];
};

export type ComponentTemplate = {
  id: string;
  type: "component";
  name: string;
  groups: ComponentGroup[];
};

export type DraftComponentTemplate = { id?: string } & Omit<ComponentTemplate, "id">;
