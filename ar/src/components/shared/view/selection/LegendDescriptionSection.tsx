// import { FC } from "react";
// import Markdown from "react-markdown";

// import {
//   COLOR_SCHEME_SELECTION,
//   IMAGE_SCHEME_SELECTION,
//   SelectionGroup,
// } from "../../../prototypes/view/states/selection";
// import { useOptionalAtomValue } from "../../hooks";
// import { LEGEND_DESCRIPTION_FIELD } from "../../types/fieldComponents/general";
// import { CommonContentWrapper } from "../../ui-components/CommonContentWrapper";
// import { useFindComponent } from "../../view-layers/hooks";

// export interface LegendDescriptionSectionProps {
//   values: (SelectionGroup & {
//     type: typeof COLOR_SCHEME_SELECTION | typeof IMAGE_SCHEME_SELECTION;
//   })["values"];
// }

// export const LegendDescriptionSection: FC<LegendDescriptionSectionProps> = ({ values }) => {
//   const legendDescriptionAtom = useFindComponent(
//     values[0].componentAtoms ?? [],
//     LEGEND_DESCRIPTION_FIELD,
//   );

//   const legendDescription = useOptionalAtomValue(legendDescriptionAtom);

//   return legendDescription?.preset?.description ? (
//     <CommonContentWrapper>
//       <Markdown skipHtml>{legendDescription?.preset?.description}</Markdown>
//     </CommonContentWrapper>
//   ) : null;
// };
