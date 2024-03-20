import { generateID } from "../../../../extension/src/shared/utils/id";
import { SwitchGroup, FieldComponent as View2Component } from "../../types/view2";
import { ComponentGroup as View3ComponentGroup } from "../../types/view3";
import { FieldFeatureType } from "../type";

import { convertComponents } from "./component";

// TODO: We might need to support multiple switch groups but we use first switch group for now.
export const convertComponentGroups = (
  view2Components: View2Component[],
  options?: {
    featureType?: FieldFeatureType;
  },
): Partial<View3ComponentGroup>[] => {
  const switchGroup = view2Components.find((c): c is SwitchGroup => c.type === "switchGroup");
  if (!switchGroup) {
    return [
      {
        id: generateID(),
        name: "default",
        components: convertComponents(view2Components, options),
      },
    ];
  }
  return switchGroup.groups.map(groupItem => ({
    id: generateID(),
    name: groupItem.title,
    components: convertComponents(
      view2Components.filter(c => !c.group || groupItem.fieldGroupID === c.group),
      options,
    ),
  }));
};
