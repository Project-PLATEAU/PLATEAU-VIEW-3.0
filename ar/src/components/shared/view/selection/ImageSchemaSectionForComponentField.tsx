// import { Button, Stack, Typography, styled } from "@mui/material";
// import { atom, useAtomValue, useSetAtom } from "jotai";
// import { useCallback, useMemo, type FC, useState, SetStateAction } from "react";

// import { isNotNullish } from "../../../prototypes/type-helpers";
// import {
//   GroupedParameterItem,
//   InspectorItem,
//   ParameterList,
//   SelectParameterItem,
// } from "../../../prototypes/ui-components";
// import { ImageIconLegend } from "../../../prototypes/ui-components/ImageIconLegend";
// import { imageSchemeSelectionAtom } from "../../../prototypes/view-layers";
// import { Component } from "../../types/fieldComponents";
// import { LayerModel } from "../../view-layers";
// import {
//   isConditionalImageSchemeComponent,
//   makeImageSchemeAtomForComponent,
//   makeImageSchemeForComponent,
// } from "../state/imageSchemaForComponent";

// export interface ImageSchemeSectionForComponentFieldProps {
//   layers: readonly LayerModel[];
// }

// const StyledButton = styled(Button)(({ theme }) => ({
//   ...theme.typography.body2,
//   display: "block",
//   width: `calc(100% + ${theme.spacing(2)})`,
//   margin: 0,
//   padding: `0 ${theme.spacing(1)}`,
//   marginLeft: theme.spacing(-1),
//   marginRight: theme.spacing(-1),
//   textAlign: "left",
// }));

// const Legend: FC<{
//   layers: readonly LayerModel[];
//   imageSchemeAtom: ReturnType<typeof makeImageSchemeForComponent>;
// }> = ({ layers, imageSchemeAtom }) => {
//   const imageScheme = useAtomValue(imageSchemeAtom);
//   const setSelection = useSetAtom(imageSchemeSelectionAtom);
//   const handleClick = useCallback(() => {
//     // Assume that every layer as the same image scheme.
//     setSelection([layers[0].id]);
//   }, [layers, setSelection]);

//   if (imageScheme == null) {
//     return null;
//   }
//   return (
//     <StyledButton variant="text" onClick={handleClick}>
//       <Stack spacing={1} width="100%" marginY={1}>
//         <Typography variant="body2">{imageScheme.name}</Typography>
//         <ImageIconLegend imageIcons={imageScheme.imageIcons} />
//       </Stack>
//     </StyledButton>
//   );
// };

// // TODO: Handle as component
// export const ImageSchemeSectionForComponentField: FC<ImageSchemeSectionForComponentFieldProps> = ({
//   layers,
// }) => {
//   const [recalcPropertyItems, setRecalcPropertyItems] = useState(0);
//   const propertyItems = useAtomValue(
//     useMemo(
//       () =>
//         atom((get): Array<[null, string] | [string, string]> => {
//           const rules =
//             layers[0].componentAtoms
//               ?.flatMap(c => {
//                 const componentValue = get(c.atom);
//                 if (isConditionalImageSchemeComponent(componentValue)) {
//                   return componentValue.preset?.rules?.map(rule =>
//                     rule.propertyName ? rule : undefined,
//                   );
//                 }
//               })
//               .filter(isNotNullish) ?? [];
//           return rules.map((rule): [string, string] => [
//             rule.id,
//             rule.legendName ?? rule.propertyName ?? "",
//           ]);
//         }),
//       [layers, recalcPropertyItems], // eslint-disable-line react-hooks/exhaustive-deps
//     ),
//   );

//   const imagePropertyAtoms = useMemo(
//     () => [
//       atom(
//         get => {
//           if (!layers[0].componentAtoms) return null;
//           for (const componentAtom of layers[0].componentAtoms) {
//             const componentValue = get(componentAtom.atom);
//             if (isConditionalImageSchemeComponent(componentValue)) {
//               const currentRuleId =
//                 componentValue.value?.currentRuleId ?? componentValue.preset?.rules?.[0].id;
//               const ruleId = currentRuleId;
//               if (ruleId) {
//                 return ruleId;
//               }
//             }
//           }
//           return null;
//         },
//         (get, set, action: SetStateAction<string | null>) => {
//           layers[0].componentAtoms?.some(componentAtom => {
//             const componentValue = get(componentAtom.atom);

//             if (isConditionalImageSchemeComponent(componentValue)) {
//               const currentRuleId =
//                 componentValue.value?.currentRuleId ?? componentValue.preset?.rules?.[0].id;
//               const update = typeof action === "function" ? action(currentRuleId ?? null) : action;
//               set(componentAtom.atom, {
//                 ...componentValue,
//                 value: {
//                   ...(componentValue.value ?? {}),
//                   currentRuleId: update,
//                 },
//               } as Component);
//               return true;
//             }
//           });
//         },
//       ),
//     ],
//     [layers],
//   );

//   const imageSchemeAtom = useMemo(() => makeImageSchemeAtomForComponent(layers), [layers]);
//   const imageSchemeValueAtom = useMemo(
//     () => makeImageSchemeForComponent(imageSchemeAtom),
//     [imageSchemeAtom],
//   );

//   const handleClickParameterItem = useCallback(() => {
//     setRecalcPropertyItems(p => p + 1);
//   }, []);

//   if (!layers.length || imagePropertyAtoms == null) {
//     return null;
//   }

//   return (
//     <ParameterList>
//       <GroupedParameterItem
//         label="色分け"
//         onClick={handleClickParameterItem}
//         content={<Legend layers={layers} imageSchemeAtom={imageSchemeValueAtom} />}>
//         <InspectorItem sx={{ width: 320 }}>
//           <ParameterList>
//             <SelectParameterItem
//               label="モデル属性"
//               atom={imagePropertyAtoms}
//               items={propertyItems as [string, string][]}
//               layout="stack"
//               displayEmpty
//             />
//           </ParameterList>
//         </InspectorItem>
//       </GroupedParameterItem>
//     </ParameterList>
//   );
// };
