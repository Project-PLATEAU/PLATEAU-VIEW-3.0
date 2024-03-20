import { type FC } from "react";

import { PointFillGradientColorField } from "../../../types/fieldComponents/point";
import { LayerModel } from "../../../view-layers";
import { WritableAtomForComponent } from "../../../view-layers/component";
import { ColorSchemeSectionForComponentField } from "../../selection/ColorSchemeSectionForComponentField";

export interface LayerPointFillGradientColorFieldProps {
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<PointFillGradientColorField>[];
}

export const LayerPointFillGradientColorField: FC<LayerPointFillGradientColorFieldProps> = ({
  layers,
  atoms,
}) => {
  if (atoms.length === 0) {
    return null;
  }

  return <ColorSchemeSectionForComponentField layers={layers} />;
};
