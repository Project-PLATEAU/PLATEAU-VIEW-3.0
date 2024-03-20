// import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
// import { useAtom } from "jotai";
// import { useMemo, useCallback, ChangeEventHandler, ReactElement } from "react";

// import { ParameterItem, ParameterList } from "../../../../prototypes/ui-components";
// import { PointVisibilityFilterField } from "../../../types/fieldComponents/point";
// import { PolygonVisibilityFilterField } from "../../../types/fieldComponents/polygon";
// import { PolylineVisibilityFilterField } from "../../../types/fieldComponents/polyline";
// import { LayerModel } from "../../../view-layers";
// import { WritableAtomForComponent } from "../../../view-layers/component";

// type SupportFields =
//   | PointVisibilityFilterField
//   | PolylineVisibilityFilterField
//   | PolygonVisibilityFilterField;

// export interface LayerVisibilityFilterFieldProps<T extends SupportFields> {
//   layers: readonly LayerModel[];
//   atoms: WritableAtomForComponent<T>[];
// }

// export const LayerVisibilityFilterField = <T extends SupportFields>({
//   atoms,
// }: LayerVisibilityFilterFieldProps<T>): ReactElement | null => {
//   const [component, setComponent] = useAtom(atoms[0]);

//   const items: [id: string, label: string][] = useMemo(
//     () =>
//       component.preset?.rules?.map(
//         r => [r.id, r.legendName || r.propertyName] as [id: string, label: string],
//       ) ?? [],
//     [component],
//   );

//   const overriddenRuleId = component.value;
//   const currentRuleId = overriddenRuleId || items[0][0];

//   const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
//     e => {
//       setComponent({ ...component, value: e.target.value });
//     },
//     [component, setComponent],
//   );

//   return (
//     <ParameterList>
//       <ParameterItem label="表示の切り替え">
//         <RadioGroup value={currentRuleId} onChange={handleChange}>
//           {items.map(item => (
//             <FormControlLabel
//               key={item[0]}
//               value={item[0]}
//               control={<Radio size="small" />}
//               label={item[1]}
//             />
//           ))}
//         </RadioGroup>
//       </ParameterItem>
//     </ParameterList>
//   );
// };
