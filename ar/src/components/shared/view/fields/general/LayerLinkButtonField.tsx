// import { Button } from "@mui/material";
// import { useAtomValue } from "jotai";
// import { type FC } from "react";

// import { ParameterList } from "../../../../prototypes/ui-components";
// import { LinkButtonField } from "../../../types/fieldComponents/general";
// import { WritableAtomForComponent } from "../../../view-layers/component";

// export interface LayerLinkButtonFieldProps {
//   atoms: WritableAtomForComponent<LinkButtonField>[];
// }

// export const LayerLinkButtonField: FC<LayerLinkButtonFieldProps> = ({ atoms }) => {
//   const linkButtonComponent = useAtomValue(atoms[0]);
//   if (atoms.length === 0) {
//     return null;
//   }

//   return (
//     <ParameterList>
//       <Button target="_blank" variant="outlined" fullWidth href={linkButtonComponent.preset.url}>
//         {linkButtonComponent.preset.title}
//       </Button>
//     </ParameterList>
//   );
// };
