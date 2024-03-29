import { FC } from "react";
import Markdown from "react-markdown";

import { LayerModel, LayerType } from "../../../prototypes/layers";
import {
  COLOR_SCHEME_SELECTION,
  IMAGE_SCHEME_SELECTION,
  SelectionGroup,
} from "../../../prototypes/view/states/selection";
import { HEATMAP_LAYER, PEDESTRIAN_LAYER, SKETCH_LAYER } from "../../../prototypes/view-layers";
import { useOptionalAtomValue } from "../../hooks";
import { LEGEND_DESCRIPTION_FIELD } from "../../types/fieldComponents/general";
import { CommonContentWrapper } from "../../ui-components/CommonContentWrapper";
import { useFindComponent } from "../../view-layers/hooks";

export interface LegendDescriptionSectionProps {
  values: (SelectionGroup & {
    type: typeof COLOR_SCHEME_SELECTION | typeof IMAGE_SCHEME_SELECTION;
  })["values"];
}

export const LegendDescriptionSection: FC<LegendDescriptionSectionProps> = ({ values }) => {
  const layer = values[0] as LayerModel<
    Exclude<LayerType, typeof PEDESTRIAN_LAYER | typeof HEATMAP_LAYER | typeof SKETCH_LAYER>
  >;
  const legendDescriptionAtom = useFindComponent(
    layer.componentAtoms ?? [],
    LEGEND_DESCRIPTION_FIELD,
  );

  const legendDescription = useOptionalAtomValue(legendDescriptionAtom);

  return legendDescription?.preset?.description ? (
    <CommonContentWrapper>
      <Markdown skipHtml components={{ a: LinkRenderer }}>
        {legendDescription?.preset?.description}
      </Markdown>
    </CommonContentWrapper>
  ) : null;
};

function LinkRenderer(props: any) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}
