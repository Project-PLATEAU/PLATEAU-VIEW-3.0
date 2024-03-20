import { isNotNullish } from "../../../../extension/src/prototypes/type-helpers";
import { generateID } from "../../../../extension/src/shared/utils/id.ts";
import { FieldComponent as View2FieldComponent } from "../../types/view2";
import { ComponentGroup as View3ComponentGroup } from "../../types/view3";
import { FieldFeatureType } from "../type.ts";

import { CONVERT_FIELDS, EXCEPT_COMPONENTS_TYPE } from "./fields";

export const convertComponent = (
  view2Component: View2FieldComponent,
  view2Components: View2FieldComponent[],
  options?: {
    featureType?: FieldFeatureType;
  },
):
  | View3ComponentGroup["components"][number]
  | View3ComponentGroup["components"][number][]
  | undefined => {
  if (
    EXCEPT_COMPONENTS_TYPE.includes(view2Component.type as (typeof EXCEPT_COMPONENTS_TYPE)[number])
  ) {
    return;
  }
  const comp = CONVERT_FIELDS[view2Component.type as keyof typeof CONVERT_FIELDS](
    view2Component as any,
    view2Components,
    options,
  );
  return Array.isArray(comp)
    ? comp.map(c => ({
        id: generateID(),
        ...c,
      }))
    : {
        id: generateID(),
        ...comp,
      };
};

export const convertComponents = (
  view2Components: View2FieldComponent[],
  options?: {
    featureType?: FieldFeatureType;
  },
): View3ComponentGroup["components"] => {
  return view2Components
    .flatMap(c => convertComponent(c, view2Components, options))
    .filter(isNotNullish);
};
