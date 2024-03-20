import { type FC } from "react";

import { CustomLegendField } from "../../../types/fieldComponents/general";
import { LayerModel } from "../../../view-layers";
import { WritableAtomForComponent } from "../../../view-layers/component";
import { CustomLegendSchemeSectionForComponentField } from "../../selection/CustomLegendSchemeSectionForComponentField";

export interface LayerCustomLegendFieldProps {
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<CustomLegendField>[];
}

export const LayerCustomLegendField: FC<LayerCustomLegendFieldProps> = ({ layers, atoms }) => {
  if (atoms.length === 0) {
    return null;
  }

  return <CustomLegendSchemeSectionForComponentField layers={layers} />;
};
