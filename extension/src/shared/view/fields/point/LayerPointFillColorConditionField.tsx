import { type FC } from "react";

import { PointFillColorConditionField } from "../../../types/fieldComponents/point";
import { LayerModel } from "../../../view-layers";
import { WritableAtomForComponent } from "../../../view-layers/component";
import { ColorSchemeSectionForComponentField } from "../../selection/ColorSchemeSectionForComponentField";

export interface LayerPointFillColorConditionFieldProps {
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<PointFillColorConditionField>[];
}

export const LayerPointFillColorConditionField: FC<LayerPointFillColorConditionFieldProps> = ({
  layers,
  atoms,
}) => {
  if (atoms.length === 0) {
    return null;
  }

  return <ColorSchemeSectionForComponentField layers={layers} />;
};
