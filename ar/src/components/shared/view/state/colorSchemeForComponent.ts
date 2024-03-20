// import { Atom, PrimitiveAtom, SetStateAction, atom } from "jotai";
// import { splitAtom } from "jotai/utils";
// import { uniqWith } from "lodash-es";

// import { ColorMap } from "../../../prototypes/color-maps";
// import {
//   QualitativeColor,
//   QualitativeColorSet,
//   QuantitativeColorMap,
// } from "../../../prototypes/datasets";
// import { isNotNullish } from "../../../prototypes/type-helpers";
// import { LayerColorScheme } from "../../../prototypes/view-layers";
// import { COLOR_MAPS } from "../../constants";
// import { ComponentBase } from "../../types/fieldComponents";
// import {
//   CONDITIONAL_COLOR_SCHEME,
//   GRADIENT_COLOR_SCHEME,
//   ConditionalColorSchemeValue,
//   GradientColorSchemeValue,
//   ValueColorSchemeValue,
//   VALUE_COLOR_SCHEME,
// } from "../../types/fieldComponents/colorScheme";
// import { LayerModel } from "../../view-layers";

// export const isColorSchemeComponent = (
//   comp: ComponentBase,
// ): comp is Extract<
//   ComponentBase,
//   { value?: ConditionalColorSchemeValue | GradientColorSchemeValue | ValueColorSchemeValue }
// > =>
//   !!(
//     comp.value &&
//     typeof comp.value === "object" &&
//     "type" in comp.value &&
//     [CONDITIONAL_COLOR_SCHEME, GRADIENT_COLOR_SCHEME, VALUE_COLOR_SCHEME].includes(comp.value.type)
//   );

// export const isConditionalColorSchemeComponent = (
//   comp: ComponentBase,
// ): comp is Extract<ComponentBase, { value?: ConditionalColorSchemeValue }> =>
//   !!(isColorSchemeComponent(comp) && CONDITIONAL_COLOR_SCHEME === comp.value?.type);

// export const isValueColorSchemeComponent = (
//   comp: ComponentBase,
// ): comp is Extract<ComponentBase, { value?: ValueColorSchemeValue }> =>
//   !!(isColorSchemeComponent(comp) && VALUE_COLOR_SCHEME === comp.value?.type);

// export const isGradientColorSchemeComponent = (
//   comp: ComponentBase,
// ): comp is Extract<ComponentBase, { value?: GradientColorSchemeValue }> =>
//   !!(isColorSchemeComponent(comp) && GRADIENT_COLOR_SCHEME === comp.value?.type);

// // TODO: Support multiple color schcme if necessary
// export const makeColorSchemeForComponent = (colorSchemeAtom: Atom<LayerColorScheme | undefined>) =>
//   atom(get => {
//     const colorScheme = get(colorSchemeAtom);
//     switch (colorScheme?.type) {
//       case "quantitative":
//         return {
//           type: "quantitative" as const,
//           name: colorScheme.name,
//           colorMap: get(colorScheme.colorMapAtom),
//           colorRange: get(colorScheme.colorRangeAtom),
//         };
//       case "qualitative": {
//         return {
//           type: "qualitative" as const,
//           name: colorScheme.name,
//           colors: get(colorScheme.colorsAtom),
//         };
//       }
//     }
//   });

// // TODO: Support multiple color schcme if necessary
// export const makeColorSchemeAtomForComponent = (layers: readonly LayerModel[]) =>
//   atom<LayerColorScheme | undefined>(get => {
//     const layer = layers[0];
//     if (!layer) return;

//     const componentAtom = layer.componentAtoms?.find(comp => {
//       const value = get(comp.atom);
//       return isColorSchemeComponent(value);
//     });
//     if (!componentAtom) {
//       return;
//     }
//     const component = get(componentAtom.atom);
//     const colorScheme = component.value as
//       | ConditionalColorSchemeValue
//       | GradientColorSchemeValue
//       | ValueColorSchemeValue;
//     switch (colorScheme.type) {
//       case GRADIENT_COLOR_SCHEME: {
//         if (!isGradientColorSchemeComponent(component)) return;

//         const currentRuleId = colorScheme.useDefault
//           ? colorScheme.currentRuleId ?? component.preset?.rules?.[0].id
//           : colorScheme.currentRuleId;
//         const rule = component.preset?.rules?.find(rule => rule.id === currentRuleId);
//         const value = component.value;
//         const colorMap = COLOR_MAPS.find(
//           c => c.name === (value?.currentColorMapName ?? rule?.colorMapName),
//         );

//         if (!colorMap) return;

//         const colorRange = [
//           value?.currentMin ?? rule?.min ?? 0,
//           value?.currentMax ?? rule?.max ?? 0,
//         ];

//         return {
//           type: "quantitative" as const,
//           name: rule?.legendName || rule?.propertyName,
//           colorMapAtom: atom(
//             () =>
//               COLOR_MAPS.find(c => c.name === (value?.currentColorMapName ?? rule?.colorMapName)),
//             (_get, set, action: SetStateAction<ColorMap>) => {
//               const component = get(componentAtom.atom);
//               if (!isGradientColorSchemeComponent(component)) return;
//               const update = typeof action === "function" ? action(colorMap) : action;
//               set(componentAtom.atom, {
//                 ...component,
//                 value: {
//                   ...(component.value ?? {}),
//                   currentColorMapName: update.name,
//                 } as typeof component.value,
//               });
//             },
//           ),
//           colorRangeAtom: atom(
//             () => colorRange,
//             (_get, set, action: SetStateAction<number[]>) => {
//               const update = typeof action === "function" ? action(colorRange) : action;
//               set(componentAtom.atom, {
//                 ...component,
//                 value: {
//                   ...(component.value ?? {}),
//                   currentMin: update[0],
//                   currentMax: update[1],
//                 } as typeof component.value,
//               });
//             },
//           ),
//           valueRangeAtom: atom(
//             () => [rule?.min, rule?.max],
//             () => {},
//           ),
//         } as QuantitativeColorMap;
//       }
//       case CONDITIONAL_COLOR_SCHEME: {
//         if (!isConditionalColorSchemeComponent(component)) return;

//         const currentRuleId = colorScheme.useDefault
//           ? colorScheme.currentRuleId ?? component.preset?.rules?.[0].id
//           : colorScheme.currentRuleId;
//         const rule = component.preset?.rules?.find(rule => rule.id === currentRuleId);
//         if (!rule?.propertyName || !rule.conditions) return;
//         const colors = rule?.conditions
//           ?.map((c): QualitativeColor | undefined => {
//             if (!c.asLegend) return;

//             const overriddenCondition = component.value?.overrideRules.find(
//               o => o.ruleId === rule.id && o.conditionId === c.id,
//             );
//             const color = overriddenCondition?.color || c.color;
//             return c.value && color
//               ? {
//                   id: c.id,
//                   value: c.value,
//                   color: color,
//                   name: c.legendName || c.value,
//                 }
//               : undefined;
//           })
//           .filter(isNotNullish);
//         const colorsAtom = atom(
//           () => colors,
//           (_get, set, action: SetStateAction<QualitativeColor[]>) => {
//             const update = typeof action === "function" ? action(colors) : action;
//             const currentRuleId = colorScheme.useDefault
//               ? colorScheme.currentRuleId ?? component.preset?.rules?.[0].id
//               : colorScheme.currentRuleId;
//             set(componentAtom.atom, {
//               ...component,
//               value: {
//                 ...(component.value ?? {}),
//                 overrideRules: uniqWith(
//                   [
//                     ...(update
//                       ?.map(color => ({
//                         ruleId: currentRuleId,
//                         conditionId: color.id,
//                         color: color.color,
//                       }))
//                       .filter(isNotNullish) ?? []),
//                     ...(component.value?.overrideRules ?? []),
//                   ],
//                   (a, b) => a.ruleId === b.ruleId && a.conditionId === b.conditionId,
//                 ),
//               } as typeof component.value,
//             });
//           },
//         ) as unknown as PrimitiveAtom<QualitativeColor[]>; // For compat
//         return colors.length
//           ? ({
//               type: "qualitative" as const,
//               name: rule.legendName || rule.propertyName,
//               colorsAtom: colorsAtom,
//               colorAtomsAtom: splitAtom(colorsAtom),
//             } as QualitativeColorSet)
//           : undefined;
//       }
//       case VALUE_COLOR_SCHEME: {
//         if (!isValueColorSchemeComponent(component)) return;
//         const colors = component.preset?.defaultValue
//           ? [
//               {
//                 id: component.id,
//                 value: component.preset.defaultValue,
//                 color: component.value?.color || component.preset.defaultValue,
//                 name: component.preset.legendName ?? "",
//               },
//             ]
//           : [];
//         const colorsAtom = atom(
//           () => colors,
//           (_get, set, action: SetStateAction<QualitativeColor[]>) => {
//             const update = typeof action === "function" ? action(colors) : action;
//             set(componentAtom.atom, {
//               ...component,
//               value: {
//                 ...(component.value ?? {}),
//                 color: update[0].color,
//               } as typeof component.value,
//             });
//           },
//         ) as unknown as PrimitiveAtom<QualitativeColor[]>; // For compat
//         return component.preset?.asLegend
//           ? ({
//               type: "qualitative" as const,
//               name: get(layer.titleAtom),
//               colorsAtom: colorsAtom,
//               colorAtomsAtom: splitAtom(colorsAtom),
//             } as QualitativeColorSet)
//           : undefined;
//       }
//     }
//   });
