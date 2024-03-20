import { SetStateAction, WritableAtom } from "jotai";
import invariant from "tiny-invariant";

import { SettingComponent } from "../api/types";
import {
  sharedAtom,
  sharedAtomValue,
  sharedStoreAtom,
  sharedStoreAtomWrapper,
  storageStoreAtom,
  storageStoreAtomWrapper,
} from "../sharedAtoms";
import { Component, ComponentBase } from "../types/fieldComponents";

import { makeComponentFieldValue } from "./componentField";

export type WritableAtomForComponent<T> = WritableAtom<T, [update: T], void>;

export type ComponentAtom<T extends ComponentBase["type"] = ComponentBase["type"]> = {
  type: Component<T>["type"];
  atom: WritableAtomForComponent<Component<T>>;
};

export type ComponentIdParams = {
  datasetId?: string;
  shareId?: string;
  componentType?: string;
};

export const makeComponentId = ({ datasetId, componentType, shareId }: ComponentIdParams) => {
  return `${datasetId}_${componentType}_${shareId}`;
};

export const makeComponentAtomWrapper = <V, A extends (unknown | SetStateAction<unknown>)[], S>(
  a: WritableAtom<V, A, S>,
  params: ComponentIdParams,
  storeable?: boolean,
  {
    shouldInitialize,
    beforeSet,
  }: { shouldInitialize?: boolean; beforeSet?: (a: unknown) => unknown } = {},
) => {
  const name = makeComponentId(params);
  if (storeable) {
    return sharedStoreAtomWrapper(name, storageStoreAtomWrapper(name, a, shouldInitialize), {
      shouldInitialize,
      beforeSet,
    });
  }
  return sharedStoreAtomWrapper(name, a, { shouldInitialize, beforeSet });
};

export const makeComponentAtoms = (
  datasetId: string | undefined,
  components: SettingComponent[],
  shareId: string | undefined,
  shouldInitialize: boolean,
): ComponentAtom[] => {
  invariant(datasetId);
  return components.map(component => {
    const name = makeComponentId({ datasetId, componentType: component.type, shareId });
    const componentForAtom = {
      ...component,
      value: makeComponentFieldValue(component),
    } as Component;
    // TODO: load value from shared data
    const a = sharedAtom(name, componentForAtom);
    if (componentForAtom.value?.storeable) {
      return {
        type: component.type,
        atom: sharedAtomValue(
          sharedStoreAtom(
            storageStoreAtom(
              a,
              componentForAtom.value?.storeable.omitPropertyNames,
              shouldInitialize,
            ),
            shouldInitialize,
          ),
        ),
      };
    }
    return {
      type: component.type,
      atom: sharedAtomValue(sharedStoreAtom(a, shouldInitialize)),
    };
  });
};

export const filterComponent = <T extends ComponentBase["type"]>(
  components: ComponentBase[],
  filter: T[],
): Component<T>[] => {
  return components.filter(c => filter.includes(c.type as T)) as unknown as Component<T>[];
};

export const findComponentAtom = <T extends ComponentBase["type"]>(
  componentAtoms: ComponentAtom[],
  filter: Component<T>["type"],
): ComponentAtom<T> | undefined => {
  return componentAtoms.find(c => filter === c.type) as unknown as ComponentAtom<T>;
};
