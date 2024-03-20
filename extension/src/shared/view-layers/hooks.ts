import { useMemo } from "react";

import { ComponentBase } from "../types/fieldComponents";

import { ComponentAtom, findComponentAtom } from "./component";

export const useFindComponent = <T extends ComponentBase["type"] = ComponentBase["type"]>(
  componentAtoms: ComponentAtom[],
  filter: T,
): ComponentAtom<T>["atom"] | undefined => {
  const atom = useMemo(() => findComponentAtom(componentAtoms, filter), [componentAtoms, filter]);
  return atom?.atom as unknown as ComponentAtom<T>["atom"];
};
