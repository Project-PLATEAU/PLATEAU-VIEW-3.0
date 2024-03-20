import { type FC } from "react";

import { PolylineFillColorConditionField } from "../../../types/fieldComponents/polyline";
import { LayerModel } from "../../../view-layers";
import { WritableAtomForComponent } from "../../../view-layers/component";
import { ColorSchemeSectionForComponentField } from "../../selection/ColorSchemeSectionForComponentField";

export interface LayerPolylineFillColorConditionFieldProps {
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<PolylineFillColorConditionField>[];
}

export const LayerPolylineFillColorConditionField: FC<
  LayerPolylineFillColorConditionFieldProps
> = ({ layers, atoms }) => {
  if (atoms.length === 0) {
    return null;
  }

  return <ColorSchemeSectionForComponentField layers={layers} />;
};
