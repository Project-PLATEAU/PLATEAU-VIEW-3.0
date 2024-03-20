import { SettingComponent } from "../api/types";
import { Component } from "../types/fieldComponents";
import { fieldSettings } from "../view/fields/fieldSettings";

export const makeComponentFieldValue = (component: SettingComponent): Component["value"] => {
  return fieldSettings[component.type]?.value;
};
