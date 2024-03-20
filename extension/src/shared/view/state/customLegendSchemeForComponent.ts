import { Atom, PrimitiveAtom, atom } from "jotai";
import { splitAtom } from "jotai/utils";
import { SetStateAction } from "react";

import { CustomLegendType, CustomLegend, CustomLegendSet } from "../../../prototypes/datasets";
import { LayerCustomLegendScheme } from "../../../prototypes/view-layers";
import { ComponentBase } from "../../types/fieldComponents";
import { CustomLegendSchemeValue } from "../../types/fieldComponents/customLegendScheme";
import { CUSTOM_LEGEND_FIELD } from "../../types/fieldComponents/general";
import { LayerModel } from "../../view-layers";

export const isCustomLegendSchemeComponent = (
  comp: ComponentBase,
): comp is Extract<ComponentBase, { value?: CustomLegendSchemeValue }> =>
  !!(comp.type === CUSTOM_LEGEND_FIELD);

export const makeCustomLegendSchemeForComponent = (
  customLegendSchemeAtom: Atom<LayerCustomLegendScheme | undefined>,
) =>
  atom(get => {
    const customLegendScheme = get(customLegendSchemeAtom);
    switch (customLegendScheme?.type) {
      case "customLegend": {
        return {
          type: "customLegend" as const,
          name: customLegendScheme.name,
          customLegends: get(customLegendScheme.customLegendsAtom),
        };
      }
    }
  });

export const makeCustomLegendSchemeAtomForComponent = (layers: readonly LayerModel[]) =>
  atom<LayerCustomLegendScheme | undefined>(get => {
    const layer = layers[0];
    if (!layer) return;
    const componentAtom = layer.componentAtoms?.find(comp => {
      const value = get(comp.atom);
      return isCustomLegendSchemeComponent(value);
    });
    if (!componentAtom) {
      return;
    }
    const component = get(componentAtom.atom);

    if (!isCustomLegendSchemeComponent(component)) return;
    const code = component.preset?.code;
    if (!code) return;

    try {
      const legends: {
        type: CustomLegendType;
        name?: string;
        legends?: CustomLegend[];
      } = JSON.parse(code);

      const customLegends =
        legends.legends?.map(l => ({
          ...l,
          type: l.type ?? legends.type,
        })) ?? [];

      const customLegendsAtom = atom(
        () => customLegends,
        (_get, set, action: SetStateAction<CustomLegend[]>) => {
          const update = typeof action === "function" ? action(customLegends) : action;
          set(componentAtom.atom, {
            ...component,
            value: {
              ...(component.value ?? {}),
              customLegends: update,
            } as typeof component.value,
          });
        },
      ) as PrimitiveAtom<CustomLegend[]>;

      return {
        type: "customLegend" as const,
        name: legends.name,
        customLegendsAtom: customLegendsAtom,
        customLegendAtomsAtom: splitAtom(customLegendsAtom),
      } as CustomLegendSet;
    } catch (error) {
      console.warn("Invalid custom legends.");
    }

    return;
  });
