import {
  EventField,
  IdealZoom,
  Realtime,
  FieldComponent as View2FieldComponent,
} from "../../types/view2";
import { GeneralSetting as View3GeneralSetting } from "../../types/view3";

export const GENERAL_FIELDS = [
  "idealZoom",
  "eventField",
  "realtime",
] satisfies View2FieldComponent["type"][];

export const convertGeneral = (view2Components: View2FieldComponent[]): View3GeneralSetting => {
  let idealZoom: IdealZoom | undefined;
  let eventField: EventField | undefined;
  let realtime: Realtime | undefined;
  for (const c of view2Components) {
    if (c.type === "idealZoom") {
      idealZoom = c;
    }
    if (c.type === "eventField") {
      eventField = c;
    }
    if (c.type === "realtime") {
      realtime = c;
    }

    if (idealZoom && eventField && realtime) break;
  }

  return {
    camera: idealZoom?.position,
    dataFetching: {
      enabled: !!realtime,
      timeInterval: realtime?.updateInterval,
    },
    featureClickEvent: {
      eventType: eventField ? "openNewTab" : "openFeatureInspector",
      urlType: eventField?.urlType,
      websiteURL: eventField?.url,
      fieldName: eventField?.field,
    },
  };
};
